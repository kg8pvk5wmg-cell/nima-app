// Controlla lo stato di un pagamento SumUp dato il suo id (creato da crea-pagamento.js).

exports.handler = async function (event) {
  const apiKey = process.env.SUMUP_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Chiave SumUp non configurata su Netlify" }) };
  }

  const id = event.queryStringParameters && event.queryStringParameters.id;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Parametro id mancante" }) };
  }

  try {
    const resp = await fetch(`https://api.sumup.com/v0.1/checkouts/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await resp.json();
    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify({ error: "Errore verifica pagamento", dettagli: data }) };
    }
    // status possibili: PENDING, PAID, FAILED, EXPIRED
    return { statusCode: 200, body: JSON.stringify({ status: data.status }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
