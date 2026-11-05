async function test() {
  const chunks = [
    "Centrifugal pumps shall comply with 31-SAMSS-004 requirements.",
    "The vendor shall provide a QA/QC manual according to ISO 9001.",
    "Non-destructive testing must be performed."
  ];

  try {
    const res = await fetch("http://localhost:4005/api/standards/search-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chunks })
    });
    const data = await res.json();
    console.log("Success:", data.success);
    console.log("Returned rules:", data.results?.length);
    if(data.results?.length > 0) {
      console.log("Top rule:", data.results[0].standardName);
    }
  } catch(e) {
    console.error(e);
  }
}
test();
