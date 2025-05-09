import React from 'react';

export const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Lädt...</h1>
      <p className="text-muted-foreground">
        Bitte warten Sie, während die Anwendung initialisiert wird.
      </p>
    </div>
  </div>
);
