export function renderProfile() {

  const container = document.createElement("div");
  container.className = "profile-container";

  const client = JSON.parse(localStorage.getItem("user"));

  if (!client) {
    container.innerHTML = `
      <p>No hay usuario logueado</p>
    `;
    return container;
  }

  container.innerHTML = `
    <div class="profile-card">

        <div class="profile-header">
            <img 
                src="https://via.placeholder.com/120"
                alt="Profile"
                class="profile-avatar"
            >

            <h2 class="profile-name">${client.name}</h2>
            <p class="profile-email">${client.email}</p>
        </div>

        <div class="profile-info">
            <div class="profile-row">
                <span>Rol:</span>
                <span>${client.role || "Cliente"}</span>
            </div>

            <div class="profile-row">
                <span>ID Usuario:</span>
                <span>${client.id_key}</span>
            </div>
        </div>

        <button class="profile-edit-btn">
            Editar perfil
        </button>

    </div>
  `;

  return container;
}