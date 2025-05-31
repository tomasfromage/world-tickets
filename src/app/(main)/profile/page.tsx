import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export default function ProfilePage() {
  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="👤 Profil"
        />
      </Page.Header>
      
      <Page.Main className="flex flex-col gap-4 mb-16 p-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold mb-4">Uživatelský profil</h2>
          <p className="text-gray-600 mb-4">
            Tato aplikace běží bez autentizace. Pro plnou funkcionalnost můžete přidat World App autentizaci.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Status:</span>
              <span className="text-green-600">Připojen</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Mód:</span>
              <span className="text-blue-600">Bez autentizace</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Verze:</span>
              <span className="text-gray-600">1.0.0</span>
            </div>
          </div>
        </div>
      </Page.Main>
    </>
  );
} 