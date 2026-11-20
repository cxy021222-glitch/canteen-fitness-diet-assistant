import { Routes, Route, Outlet } from 'react-router-dom';
import { WorkbenchProvider } from '@/lib/store';
import { ModelConfigProvider } from '@/lib/modelConfig';
import { WorkbenchShell } from '@/components/WorkbenchShell';
import WorkbenchPage from '@/pages/WorkbenchPage/WorkbenchPage';
import CapturePage from '@/pages/CapturePage/CapturePage';
import TranscriptPage from '@/pages/TranscriptPage/TranscriptPage';
import ComposePage from '@/pages/ComposePage/ComposePage';
import WritePage from '@/pages/WritePage/WritePage';
import PublishPage from '@/pages/PublishPage/PublishPage';
import DeliverPage from '@/pages/DeliverPage/DeliverPage';
import AgentsPage from '@/pages/AgentsPage/AgentsPage';
import SkillsPage from '@/pages/SkillsPage/SkillsPage';
import SettingsPage from '@/pages/SettingsPage/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';

function ShellLayout() {
  return (
    <WorkbenchShell>
      <Outlet />
    </WorkbenchShell>
  );
}

export default function App() {
  return (
    <ModelConfigProvider>
      <WorkbenchProvider>
        <Routes>
          <Route element={<ShellLayout />}>
            <Route index element={<WorkbenchPage />} />
            <Route path="capture" element={<CapturePage />} />
            <Route path="transcript" element={<TranscriptPage />} />
            <Route path="compose" element={<ComposePage />} />
            <Route path="write" element={<WritePage />} />
            <Route path="publish" element={<PublishPage />} />
            <Route path="deliver" element={<DeliverPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </WorkbenchProvider>
    </ModelConfigProvider>
  );
}
