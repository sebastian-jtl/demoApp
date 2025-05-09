import { completeSetup, getSessionToken } from '@/lib/bridgeService';

export const setupTenant = async () : Promise<boolean> => {
    
    const sessionToken = await getSessionToken();
    console.log(sessionToken);
    let response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tenant/connect`, 
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sessionToken,
        })
    })

    if(response.ok) {
        const body = await response.text();
        const { tenantId, message } = JSON.parse(body);
        await completeSetup();
        return true;
    }

    return false;
}