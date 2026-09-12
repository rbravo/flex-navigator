const messages = [
  "Starting the system...",
  "Preparing the environment...",
  "Adjusting settings..."
];

let index = 0;
const loadingMessage = document.getElementById("loading-message");

const intervalId = setInterval(() => {
  loadingMessage.textContent = messages[index];
  index = (index + 1) % messages.length;
}, 1500);

// Pare o carregamento ao finalizar o carregamento do sistema
// Exemplo: você pode substituir por sua própria lógica de carregamento
window.addEventListener("load", () => {
  clearInterval(intervalId);
  document.getElementById("loading-message").remove();
});
