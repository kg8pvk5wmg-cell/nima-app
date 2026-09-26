// Crea un pagamento SumUp (Hosted Checkout) e restituisce il link a cui mandare la cliente.
// La chiave segreta SUMUP_API_KEY viene letta dalle variabili d'ambiente di Netlify,
// non è mai visibile nel codice o nel browser.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Metodo non consentito" };
  }

  const apiKey = process.env.SUMUP_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Chiave SumUp non configurata su Netlify" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Corpo della richiesta non valido" }) };
  }

  const { importo, descrizione, riferimento, redirectUrl } = body;
  if (!importo || !riferimento) {
    return { statusCode: 400, body: JSON.stringify({ error: "importo e riferimento sono obbligatori" }) };
  }

  try {
    // 1) Recupera il codice del negozio (merchant_code) collegato alla chiave API
    const meResp = await fetch("https://api.sumup.com/v0.1/me", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const me = await meResp.json();
    if (!meResp.ok) {
      console.error("SumUp /me fallita:", meResp.status, JSON.stringify(me));
      return { statusCode: meResp.status, body: JSON.stringify({ error: "Errore recupero account SumUp", dettagli: me }) };
    }
    const merchantCode =
      (me.merchant_profile && me.merchant_profile.merchant_code) ||
      me.merchant_code;
    if (!merchantCode) {
      return { statusCode: 500, body: JSON.stringify({ error: "Merchant code non trovato per questo account SumUp" }) };
    }

    // 2) Crea il checkout ospitato da SumUp
    const checkoutResp = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: riferimento,
        amount: importo,
        currency: "EUR",
        merchant_code: merchantCode,
        description: descrizione || "Nima Hair & Beauty",
        redirect_url: redirectUrl,
        hosted_checkout: { enabled: true },
      }),
    });
    const checkout = await checkoutResp.json();
    if (!checkoutResp.ok) {
      console.error("SumUp /checkouts fallita:", checkoutResp.status, JSON.stringify(checkout));
      return { statusCode: checkoutResp.status, body: JSON.stringify({ error: "Errore creazione pagamento", dettagli: checkout }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: checkout.id,
        url: checkout.hosted_checkout_url,
      }),
    };
  } catch (e) {
    console.error("Errore imprevisto in crea-pagamento:", e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
