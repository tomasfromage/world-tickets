import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export default function ProfilePage() {
  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="👤 Profile"
        />
      </Page.Header>
      
      <Page.Main className="flex flex-col gap-4 mb-16 p-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold mb-4">User profile</h2>
          <p className="text-gray-600 mb-4">
            This application runs without authentication. To fully function, you can add World App authentication.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Status:</span>
              <span className="text-green-600">Connected</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Mode:</span>
              <span className="text-blue-600">Without authentication</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Version:</span>
              <span className="text-gray-600">1.0.0</span>
            </div>
          </div>
        </div>
      </Page.Main>
    </>
  );
} 