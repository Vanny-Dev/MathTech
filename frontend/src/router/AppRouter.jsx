import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import MainLayout from '../components/layout/MainLayout.jsx';

// Auth pages
import LoginPage    from '../pages/Auth/LoginPage.jsx';
import RegisterPage from '../pages/Auth/RegisterPage.jsx';

// Student pages
import HomePage                  from '../pages/Home/HomePage.jsx';
import StartPage                 from '../pages/Home/StartPage.jsx';
import TopicsPage                from '../pages/Home/TopicsPage.jsx';
import AboutPage                 from '../pages/Home/AboutPage.jsx';
import InstructionsPage          from '../pages/Home/InstructionsPage.jsx';
import ObjectivesPage            from '../pages/LearningCompetencies/ObjectivesPage.jsx';
import CompetenciesPage          from '../pages/LearningCompetencies/CompetenciesPage.jsx';
import DiscussionPage            from '../pages/Lesson/DiscussionPage.jsx';
import ConceptsPage              from '../pages/Lesson/ConceptsPage.jsx';
import ExamplesPage              from '../pages/Lesson/ExamplesPage.jsx';
import PracticeExercisesPage     from '../pages/Activities/PracticeExercisesPage.jsx';
import IndependentActivityPage   from '../pages/Activities/IndependentActivityPage.jsx';
import ViewScorePage             from '../pages/Feedback/ViewScorePage.jsx';
import CorrectAnswersPage        from '../pages/Feedback/CorrectAnswersPage.jsx';
import ExplanationPage           from '../pages/Feedback/ExplanationPage.jsx';
import ReviewIncorrectPage       from '../pages/Review/ReviewIncorrectPage.jsx';
import RetryPage                 from '../pages/Review/RetryPage.jsx';
import PerformanceSummaryPage    from '../pages/Progress/PerformanceSummaryPage.jsx';
import CompletedActivitiesPage   from '../pages/Progress/CompletedActivitiesPage.jsx';
import DeveloperPage             from '../pages/About/DeveloperPage.jsx';
import ReferencesPage            from '../pages/About/ReferencesPage.jsx';

// Teacher pages
import TeacherDashboard from '../pages/Teacher/TeacherDashboard.jsx';
import TeacherStudents  from '../pages/Teacher/TeacherStudents.jsx';
import TeacherMonitor   from '../pages/Teacher/TeacherMonitor.jsx';
import TeacherSchedule  from '../pages/Teacher/TeacherSchedule.jsx';
import StudentDetail    from '../pages/Teacher/StudentDetail.jsx';

// Guards
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const TeacherRoute = ({ children }) => {
  const { user, isTeacher } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isTeacher) return <Navigate to="/home" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/home'} replace />;
};

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* Student routes */}
      <Route path="/home" element={<PrivateRoute><MainLayout><HomePage /></MainLayout></PrivateRoute>} />
      <Route path="/home/start"        element={<PrivateRoute><MainLayout><StartPage /></MainLayout></PrivateRoute>} />
      <Route path="/topics"            element={<PrivateRoute><MainLayout><TopicsPage /></MainLayout></PrivateRoute>} />
      <Route path="/home/about"        element={<PrivateRoute><MainLayout><AboutPage /></MainLayout></PrivateRoute>} />
      <Route path="/home/instructions" element={<PrivateRoute><MainLayout><InstructionsPage /></MainLayout></PrivateRoute>} />

      <Route path="/competencies"              element={<PrivateRoute><MainLayout><ObjectivesPage /></MainLayout></PrivateRoute>} />
      <Route path="/competencies/competencies" element={<PrivateRoute><MainLayout><CompetenciesPage /></MainLayout></PrivateRoute>} />

      <Route path="/lesson"           element={<PrivateRoute><MainLayout><DiscussionPage /></MainLayout></PrivateRoute>} />
      <Route path="/lesson/concepts"  element={<PrivateRoute><MainLayout><ConceptsPage /></MainLayout></PrivateRoute>} />
      <Route path="/lesson/examples"  element={<PrivateRoute><MainLayout><ExamplesPage /></MainLayout></PrivateRoute>} />

      <Route path="/activities"             element={<PrivateRoute><MainLayout><PracticeExercisesPage /></MainLayout></PrivateRoute>} />
      <Route path="/activities/independent" element={<PrivateRoute><MainLayout><IndependentActivityPage /></MainLayout></PrivateRoute>} />

      <Route path="/feedback"             element={<PrivateRoute><MainLayout><ViewScorePage /></MainLayout></PrivateRoute>} />
      <Route path="/feedback/answers"     element={<PrivateRoute><MainLayout><CorrectAnswersPage /></MainLayout></PrivateRoute>} />
      <Route path="/feedback/explanation" element={<PrivateRoute><MainLayout><ExplanationPage /></MainLayout></PrivateRoute>} />

      <Route path="/review"       element={<PrivateRoute><MainLayout><ReviewIncorrectPage /></MainLayout></PrivateRoute>} />
      <Route path="/review/retry" element={<PrivateRoute><MainLayout><RetryPage /></MainLayout></PrivateRoute>} />

      <Route path="/progress"           element={<PrivateRoute><MainLayout><PerformanceSummaryPage /></MainLayout></PrivateRoute>} />
      <Route path="/progress/completed" element={<PrivateRoute><MainLayout><CompletedActivitiesPage /></MainLayout></PrivateRoute>} />

      <Route path="/about"            element={<PrivateRoute><MainLayout><DeveloperPage /></MainLayout></PrivateRoute>} />
      <Route path="/about/references" element={<PrivateRoute><MainLayout><ReferencesPage /></MainLayout></PrivateRoute>} />

      {/* Teacher routes */}
      <Route path="/teacher/dashboard"                        element={<TeacherRoute><MainLayout><TeacherDashboard /></MainLayout></TeacherRoute>} />
      <Route path="/teacher/students"                         element={<TeacherRoute><MainLayout><TeacherStudents /></MainLayout></TeacherRoute>} />
      <Route path="/teacher/monitor"                          element={<TeacherRoute><MainLayout><TeacherMonitor /></MainLayout></TeacherRoute>} />
      <Route path="/teacher/schedule"                         element={<TeacherRoute><MainLayout><TeacherSchedule /></MainLayout></TeacherRoute>} />
      <Route path="/teacher/monitor/:moduleId/student/:studentId" element={<TeacherRoute><MainLayout><StudentDetail /></MainLayout></TeacherRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
