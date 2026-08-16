import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLessonApi } from '../../api/moduleApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import useProgress from '../../hooks/useProgress.js';
import Loader from '../../components/shared/Loader.jsx';

export default function DiscussionPage() {
  const { moduleId } = useWorkbook();
  const navigate     = useNavigate();
  const [lesson, setLesson]   = useState(null);
  const [loading, setLoading] = useState(true);

  useProgress('lesson');

  useEffect(() => {
    if (!moduleId) { setLoading(false); return; }
    getLessonApi(moduleId)
      .then(({ data }) => setLesson(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return <Loader text="Loading lesson..." />;

  return (
    <div style={{ width: '100%' }}>
      <h1 className="section-title">Discussion</h1>
      <div className="comic-card" style={{ maxWidth: '720px', marginBottom: '1.25rem', overflowWrap: 'anywhere' }}>
        {lesson?.discussion
          ? <div dangerouslySetInnerHTML={{ __html: lesson.discussion }}
              style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.8, fontSize: '0.98rem' }} />
          : <p style={{ fontFamily: 'Nunito, sans-serif' }}>No discussion content yet.</p>
        }
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" style={{ flex: '1 1 140px', minWidth: 0 }} onClick={() => navigate('/lesson/concepts')}>Concepts <ArrowRight size={15} /></button>
        <button className="btn btn-outline" style={{ flex: '1 1 140px', minWidth: 0 }} onClick={() => navigate('/lesson/examples')}>Examples <ArrowRight size={15} /></button>
        <button className="btn btn-primary" style={{ flex: '1 1 100%', minWidth: 0 }} onClick={() => navigate('/activities')}>Go to Activities <ArrowRight size={15} /></button>
      </div>
    </div>
  );
}
