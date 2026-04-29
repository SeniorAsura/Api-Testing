async function withdraw() {
  const name = document.getElementById("name").value;
  const bank = document.getElementById("bank").value;
  const account = document.getElementById("account").value;
  const amount = document.getElementById("amount").value;

  const status = document.getElementById("status");

  if (!name || !bank || !account || !amount) {
    status.innerText = "❌ Please fill all fields";
    return;
  }

  status.innerText = "⏳ Processing withdrawal...";

  try {
    const res = await fetch("/api/withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        bank,
        account,
        amount
      })
    });

    const data = await res.json();

    if (res.ok) {
      status.innerText = "✅ " + (data.message || "Withdrawal successful");
    } else {
      status.innerText = "❌ " + (data.message || "Withdrawal failed");
    }

  } catch (err) {
    status.innerText = "❌ Network error";
  }
}
