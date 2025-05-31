'use client';
import { CircularIcon, Marble } from '@worldcoin/mini-apps-ui-kit-react';
import { CheckCircleSolid } from 'iconoir-react';

/**
 * UserInfo component zobrazuje základní informace o aplikaci
 * Bez autentizace zobrazuje placeholder informace
 */
export const UserInfo = () => {
  return (
    <div className="flex flex-row items-center justify-start gap-4 rounded-xl w-full border-2 border-gray-200 p-4">
      <Marble className="w-14" />
      <div className="flex flex-row items-center justify-center">
        <span className="text-lg font-semibold">
          🎫 Tickets App
        </span>
        <CircularIcon size="sm" className="ml-2">
          <CheckCircleSolid className="text-blue-600" />
        </CircularIcon>
      </div>
    </div>
  );
};
