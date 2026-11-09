// Cole o link PUBLICO de resposta do Google Forms entre as aspas.
// Exemplo: https://docs.google.com/forms/d/e/SEU_ID/viewform
window.STUDYFLOW_GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdghnz8r1F5XnLR9NKSIGMZAe9MmAlJEFM7bUD9o1WPq5lTxg/viewform";

document.addEventListener("DOMContentLoaded", () => {
  const link = document.getElementById("googleFormLink");
  const info = document.getElementById("googleFormInfo");
  const url = window.STUDYFLOW_GOOGLE_FORM_URL.trim();
  if (url.startsWith("https://docs.google.com/forms/") || url.startsWith("https://forms.gle/")) {
    link.href = url;
    info.textContent = "O questionário será aberto em uma nova aba.";
  } else {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      info.textContent = "O link ainda não foi configurado: edite form-config.js.";
    });
  }
});
