import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { setupTenant } from '@/lib/setupService';

export const SetupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onConnectClick = useCallback(async (): Promise<void> => {
    const doBackendSetup = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await setupTenant();
        setSuccess(result);
      } catch (error) {
        setError(`Setup error: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    doBackendSetup();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-[450px] shadow-lg">
          <CardHeader>
            <CardTitle>Einrichtung läuft...</CardTitle>
            <CardDescription>Bitte warten Sie, während wir Ihre Plattform verbinden</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-[450px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary">Verbindung erfolgreich!</CardTitle>
            <CardDescription>
              Ihre JTL-Plattform wurde erfolgreich verbunden.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Sie können nun alle Funktionen der Test-App nutzen.</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                // In einer echten Anwendung würden wir hier zur ERP-Seite navigieren
                window.location.href = '/erp';
              }}
            >
              Zur App
            </Button>
            <Button 
              onClick={() => window.close()}
            >
              Schließen
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[450px] shadow-lg">
        <CardHeader>
          <CardTitle>Test-App einrichten</CardTitle>
          <CardDescription>
            Verbinden Sie diese App mit Ihrem JTL-Cloud-Konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Diese App benötigt Zugriff auf Ihre JTL-Plattform-Daten, um korrekt zu funktionieren. 
            Durch das Klicken auf "Jetzt verbinden" erteilen Sie der App die notwendigen Berechtigungen.
          </p>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline" 
            disabled={isLoading}
            onClick={() => window.close()}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={onConnectClick}
            disabled={isLoading}
          >
            Jetzt verbinden
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SetupPage; 