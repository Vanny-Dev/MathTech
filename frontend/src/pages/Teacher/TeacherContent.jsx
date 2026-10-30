import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import DOMPurify from 'dompurify';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import ComicDiscussion from '../../components/comic/ComicDiscussion.jsx';
import WorkedExample from '../../components/shared/WorkedExample.jsx';
import { getModulesApi, getModuleByIdApi, createModuleApi, updateModuleApi } from '../../api/moduleApi.js';
import { getActivitiesApi, createActivityApi, updateActivityApi, reorderActivitiesApi } from '../../api/activityApi.js';
import './TeacherContent.css';

const emptyLesson = () => ({ title: '', week: 0, topicNumber: 0, objectives: '', competencies: '', discussion: '', concepts: '', examples: [], references: '' });
const emptyQuestion = () => ({ type: 'multiple_choice', question: '', choices: '', correctAnswer: '', explanation: '', points: 1, isPractice: false });
const listFields = ['objectives', 'competencies', 'concepts', 'references'];
const splitLines = (value) => value.split('\n').map(line => line.trim()).filter(Boolean);
const editLesson = (data) => ({ ...data, ...Object.fromEntries(listFields.map(key => [key, (data[key] || []).join('\n')])) });
const message = (error) => error.response?.data?.message || 'Could not save changes. Please try again.';

function Field({ label, children }) {
  return <label className="content-field"><span>{label}</span>{children}</label>;
}

export default function TeacherContent() {
  const [modules, setModules] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [activities, setActivities] = useState([]);
  const [question, setQuestion] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [questionDirty, setQuestionDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState(null);

  const refreshList = async () => {
    const { data } = await getModulesApi();
    setModules(data);
  };
  useEffect(() => {
    refreshList().catch(error => setNotice({ error: true, text: message(error) })).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    const guard = (event) => {
      if (dirty || questionDirty) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty, questionDirty]);

  const open = async (id) => {
    if ((dirty || questionDirty) && !window.confirm('Discard unsaved changes?')) return;
    setBusy(true); setNotice(null);
    try {
      if (id) {
        const [content, questions] = await Promise.all([getModuleByIdApi(id), getActivitiesApi(id)]);
        setLesson(editLesson(content.data)); setActivities(questions.data);
      } else { setLesson(emptyLesson()); setActivities([]); }
      setQuestion(null); setDirty(false); setQuestionDirty(false); setPreview(false);
    } catch (error) { setNotice({ error: true, text: message(error) }); }
    finally { setBusy(false); }
  };
  const changeLesson = (key, value) => { setLesson(prev => ({ ...prev, [key]: value })); setDirty(true); };
  const changeQuestion = (key, value) => { setQuestion(prev => ({ ...prev, [key]: value })); setQuestionDirty(true); };

  const saveLesson = async (event) => {
    event.preventDefault(); setBusy(true); setNotice(null);
    try {
      const payload = { ...lesson, ...Object.fromEntries(listFields.map(key => [key, splitLines(lesson[key])])) };
      const { data } = lesson._id ? await updateModuleApi(lesson._id, payload) : await createModuleApi(payload);
      setLesson(editLesson(data)); setDirty(false);
      setNotice({ text: 'Lesson saved. Use Topic Schedule to publish or schedule it.' });
      await refreshList();
    } catch (error) { setNotice({ error: true, text: message(error) }); }
    finally { setBusy(false); }
  };
  const chooseQuestion = (item) => {
    if (questionDirty && !window.confirm('Discard unsaved question changes?')) return;
    setQuestion(item ? { ...item, choices: (item.choices || []).join('\n'), correctAnswer: String(item.correctAnswer ?? '') } : emptyQuestion());
    setQuestionDirty(false);
  };
  const saveQuestion = async (event) => {
    event.preventDefault(); setBusy(true); setNotice(null);
    try {
      const payload = { ...question, moduleId: lesson._id, choices: splitLines(question.choices), points: Number(question.points),
        order: question._id ? question.order : Math.max(-1, ...activities.map(item => item.order || 0)) + 1 };
      const { data } = question._id ? await updateActivityApi(question._id, payload) : await createActivityApi(payload);
      setActivities(prev => question._id ? prev.map(item => item._id === data._id ? data : item) : [...prev, data]);
      setQuestion(null); setQuestionDirty(false); setNotice({ text: 'Question saved. Existing student scores and completion records are preserved.' });
    } catch (error) { setNotice({ error: true, text: message(error) }); }
    finally { setBusy(false); }
  };
  const move = async (index, direction) => {
    const next = [...activities];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setBusy(true); setNotice(null);
    try {
      await reorderActivitiesApi(lesson._id, next.map(item => item._id));
      setActivities(next.map((item, order) => ({ ...item, order })));
      setNotice({ text: 'Question order saved.' });
    } catch (error) { setNotice({ error: true, text: message(error) }); }
    finally { setBusy(false); }
  };

  return <div className="teacher-content">
    <SectionTitle icon={BookOpen}>Lessons & Activities</SectionTitle>
    <p>Add future lessons, prepare questions, and publish them through <Link to="/teacher/schedule">Topic Schedule</Link>.</p>
    <p className="content-history-note">Student scores, attempts, and completed activities are kept when content is updated. For a new assessment for everyone, create a new lesson.</p>
    {notice && <div className={`content-notice ${notice.error ? 'content-error' : ''}`} role={notice.error ? 'alert' : 'status'}>{notice.text}</div>}
    <div className="content-workspace">
      <aside className="comic-card content-library" aria-label="Lesson library">
        <button className="btn btn-teal" disabled={busy || loading} onClick={() => open(null)}><Plus size={16} /> Add lesson</button>
        {loading ? <p>Loading lessons…</p> : modules.length === 0 ? <p>No lessons yet. Add your first lesson.</p> : modules.map(item =>
          <button key={item._id} className={`content-lesson ${lesson?._id === item._id ? 'selected' : ''}`} disabled={busy} onClick={() => open(item._id)}>
            <strong>{item.title}</strong><span>Week {item.week} · Topic {item.topicNumber} · {item.isPublished ? item.isReleased ? 'Open' : 'Published / locked' : 'Unpublished'}</span>
          </button>)}
      </aside>
      <main className="content-editor" aria-busy={busy}>
        {!lesson ? <div className="comic-card">Select a lesson to view its content and questions, or add a new lesson.</div> : <>
          <form className="comic-card" onSubmit={saveLesson}>
            <h2>{lesson._id ? 'Edit lesson' : 'New lesson'}</h2>
            <p>{lesson.isPublished ? 'Changes to this published lesson apply when saved.' : 'This lesson stays unpublished until you publish it through Topic Schedule.'}</p>
            <fieldset disabled={busy} className="content-fields">
              <Field label="Lesson title"><input className="math-input" required value={lesson.title} onChange={e => changeLesson('title', e.target.value)} /></Field>
              <div className="content-row">
                {['week', 'topicNumber'].map(key => <Field key={key} label={key === 'week' ? 'Week' : 'Topic number'}><input className="math-input" type="number" min="0" step="1" required value={lesson[key]} onChange={e => changeLesson(key, Number(e.target.value))} /></Field>)}
              </div>
              {['objectives', 'competencies'].map(key => <Field key={key} label={`${key === 'objectives' ? 'Objectives' : 'Learning competencies'} (one per line)`}><textarea className="math-input" rows="3" value={lesson[key]} onChange={e => changeLesson(key, e.target.value)} /></Field>)}
              <Field label="Discussion"><textarea className="math-input" rows="10" value={lesson.discussion || ''} onChange={e => changeLesson('discussion', e.target.value)} /></Field>
              <small>Use HTML for the existing comic presentation: &lt;h3&gt;Panel 1 — Title&lt;/h3&gt; starts a slide. &lt;p&gt;&lt;strong&gt;Teacher:&lt;/strong&gt; Dialogue&lt;/p&gt; adds a speech bubble. Use &lt;p&gt; for paragraphs.</small>
              <button type="button" className="btn btn-outline" onClick={() => changeLesson('discussion', `${lesson.discussion || ''}\n<h3>Panel ${(lesson.discussion?.match(/<h3[\s>]/gi)?.length || 0) + 1} — Title</h3>\n<p><strong>Teacher:</strong> Add your discussion here.</p>\n`)}>Insert discussion panel</button>
              <Field label="Concepts (one per line)"><textarea className="math-input" rows="4" value={lesson.concepts} onChange={e => changeLesson('concepts', e.target.value)} /></Field>
              <h3>Worked examples</h3>
              {(lesson.examples || []).map((example, index) => <div className="content-example" key={index}>
                <Field label={`Example ${index + 1} title`}><input className="math-input" required value={example.title} onChange={e => changeLesson('examples', lesson.examples.map((item, i) => i === index ? { ...item, title: e.target.value } : item))} /></Field>
                <Field label="Example content (use line breaks for steps)"><textarea className="math-input" required rows="5" value={example.content} onChange={e => changeLesson('examples', lesson.examples.map((item, i) => i === index ? { ...item, content: e.target.value } : item))} /></Field>
                <Field label="Image URL (optional)"><input className="math-input" value={example.image || ''} onChange={e => changeLesson('examples', lesson.examples.map((item, i) => i === index ? { ...item, image: e.target.value } : item))} /></Field>
                <button className="btn btn-outline" type="button" onClick={() => changeLesson('examples', lesson.examples.filter((_, i) => i !== index))}>Remove example</button>
              </div>)}
              <button type="button" className="btn btn-outline" onClick={() => changeLesson('examples', [...lesson.examples, { title: '', content: '', image: '' }])}>Add example</button>
              <Field label="References (one per line)"><textarea className="math-input" rows="3" value={lesson.references} onChange={e => changeLesson('references', e.target.value)} /></Field>
              <div className="content-row">
                <button className="btn btn-teal" type="submit">{busy ? 'Saving…' : lesson._id ? 'Save lesson' : 'Save unpublished lesson'}</button>
                <button className="btn btn-outline" type="button" onClick={() => setPreview(!preview)}>{preview ? 'Hide preview' : 'Preview lesson'}</button>
                {lesson._id && <Link className="btn btn-outline" to="/teacher/schedule">Publish / Schedule</Link>}
              </div>
              {dirty && <small>Unsaved lesson changes</small>}
            </fieldset>
          </form>
          {preview && <section className="comic-card content-preview" aria-label="Student lesson preview">
            <h2>{lesson.title || 'Lesson preview'}</h2>
            <h3>Objectives</h3><ul>{splitLines(lesson.objectives).map((line, i) => <li key={i}>{line}</li>)}</ul>
            <h3>Learning competencies</h3><ul>{splitLines(lesson.competencies).map((line, i) => <li key={i}>{line}</li>)}</ul>
            <ComicDiscussion html={DOMPurify.sanitize(lesson.discussion)} />
            <h3>Concepts</h3>{splitLines(lesson.concepts).map((line, i) => <p key={i}>{line}</p>)}
            {lesson.examples.map((example, i) => <div key={i}><h3>{example.title}</h3>{example.image && <img src={example.image} alt={example.title} style={{ maxWidth: '100%' }} />}<WorkedExample content={example.content} /></div>)}
            <h3>References</h3>{splitLines(lesson.references).map((line, i) => <p key={i}>{line}</p>)}
          </section>}
          <section className="comic-card">
            <h2>Activity questions ({activities.length})</h2>
            {!lesson._id ? <p>Save the lesson before adding questions.</p> : <>
              <p>Practice and graded questions each follow the order shown here.</p>
              <button className="btn btn-teal" disabled={busy} onClick={() => chooseQuestion(null)}><Plus size={16} /> Add question</button>
              {!activities.length && <p>No questions yet.</p>}
              <ol className="content-questions">{activities.map((item, index) => <li key={item._id}>
                <div><strong>{item.question}</strong><small>{item.isPractice ? 'Practice' : 'Graded'} · {item.type.replaceAll('_', ' ')} · {item.points} pts</small></div>
                <div className="content-row">
                  <button className="btn btn-outline" disabled={busy} onClick={() => chooseQuestion(item)}>Edit</button>
                  <button className="btn btn-outline" disabled={busy || question !== null || index === 0} aria-label={`Move question ${index + 1} up`} onClick={() => move(index, -1)}><ArrowUp size={16} /></button>
                  <button className="btn btn-outline" disabled={busy || question !== null || index === activities.length - 1} aria-label={`Move question ${index + 1} down`} onClick={() => move(index, 1)}><ArrowDown size={16} /></button>
                </div>
              </li>)}</ol>
            </>}
          </section>
          {question && <form className="comic-card" onSubmit={saveQuestion}>
            <h2>{question._id ? 'Edit question' : 'New question'}</h2>
            <fieldset className="content-fields" disabled={busy}>
              <Field label="Activity category"><select className="math-input" value={String(question.isPractice)} onChange={e => changeQuestion('isPractice', e.target.value === 'true')}><option value="false">Graded activity</option><option value="true">Practice exercise</option></select></Field>
              <Field label="Question format"><select className="math-input" value={question.type} onChange={e => { changeQuestion('type', e.target.value); changeQuestion('correctAnswer', ''); }}><option value="multiple_choice">Multiple choice</option><option value="true_false">True / False</option><option value="fill_blank">Fill in the blank</option></select></Field>
              <Field label="Question"><textarea className="math-input" required rows="3" value={question.question} onChange={e => changeQuestion('question', e.target.value)} /></Field>
              {question.type === 'multiple_choice' && <Field label="Choices (one per line, at least two)"><textarea className="math-input" required rows="4" value={question.choices} onChange={e => changeQuestion('choices', e.target.value)} /></Field>}
              <Field label="Correct answer">{question.type === 'fill_blank' ? <input className="math-input" required value={question.correctAnswer} onChange={e => changeQuestion('correctAnswer', e.target.value)} /> : <select className="math-input" required value={question.correctAnswer} onChange={e => changeQuestion('correctAnswer', e.target.value)}>
                <option value="">Select correct answer</option>{(question.type === 'true_false' ? ['true', 'false'] : splitLines(question.choices)).map((value, i) => <option key={i} value={value}>{value}</option>)}
              </select>}</Field>
              <Field label="Explanation"><textarea className="math-input" rows="3" value={question.explanation} onChange={e => changeQuestion('explanation', e.target.value)} /></Field>
              <Field label="Points"><input className="math-input" required type="number" min="0.01" step="any" value={question.points} onChange={e => changeQuestion('points', e.target.value)} /></Field>
              <div className="content-row"><button type="submit" className="btn btn-teal">Save question</button><button type="button" className="btn btn-outline" onClick={() => { if (!questionDirty || window.confirm('Discard unsaved question changes?')) { setQuestion(null); setQuestionDirty(false); } }}>Cancel</button></div>
            </fieldset>
          </form>}
        </>}
      </main>
    </div>
  </div>;
}
