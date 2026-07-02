/**
 * Check the deployed GitHub Pages login HTML
 */
const http = require("https");
const url = "https://geshvic.github.io/luse-dashboard/";

http.get(url, res => {
  let data = "";
  res.on("data", chunk => data += chunk.toString());
  res.on("end", () => {
    // Login HTML
    const logins = [
      { name: "View Password toggle", id: "pwToggle", field: "onclick" },
      { name: "Sign Up span", id: "showSignup", field: "onclick" },
      { name: "Forgot span", id: "forgotLogin", field: "onclick" },
      { name: "Login button", id: "loginBtn", field: "onclick" },
      { name: "Login gate", id: "loginGate", field: "id" },
      { name: "Login form", id: "loginForm", field: "id" },
      { name: "Signup form", id: "signupForm", field: "id" },
    ];

    for (const li of logins) {
      const idx = data.indexOf(li.id);
      if (idx >= 0) {
        console.log("--- " + li.name + " ---");
        console.log(data.substring(Math.max(0, idx - 60), Math.min(data.length, idx + 180)));
        console.log();
      } else {
        console.log("--- " + li.name + " --- NOT FOUND!");
      }
    }

    // Check the IIFE that checks session
    const iifeIdx = data.indexOf("(function()");
    if (iifeIdx >= 0) console.log("\n--- Session check IIFE ---\n" + data.substring(iifeIdx, iifeIdx + 300));

    // Check togglePw function
    const toggleIdx = data.indexOf("function togglePw");
    if (toggleIdx >= 0) console.log("\n--- togglePw ---\n" + data.substring(toggleIdx, toggleIdx + 200));

    // Check showSignup
    const ssIdx = data.indexOf("function showSignup");
    if (ssIdx >= 0) console.log("\n--- showSignup ---\n" + data.substring(ssIdx, ssIdx + 300));

    // Check forgotLogin
    const flIdx = data.indexOf("function forgotLogin");
    if (flIdx >= 0) console.log("\n--- forgotLogin ---\n" + data.substring(flIdx, flIdx + 300));

    console.log("\n--- After loginAuthed (authed state) ---");
    const authIdx = data.indexOf("loginAuthed");
    if (authIdx >= 0) console.log(data.substring(authIdx - 30, Math.min(data.length, authIdx + 300)));
  });
}).on("error", e => console.log("Error:", e.message));
