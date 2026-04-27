// 🔐 LOGIN FUNCTION (used by onclick)
async function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert(data.message);
    window.location.href = "/home";
  } else {
    alert(data.message);
  }
}


// 🚀 SIGNUP FUNCTION
async function signup() {
  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Account created 🚀");
    flip(); // flip back to login
  } else {
    alert(data.message);
  }
}