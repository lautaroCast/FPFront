export default function Profile() {
  const container = document.createElement("div");
  container.className = "profile-container";

  container.innerHTML = `
    <div class="profile-card">

        <div class="profile-header">
            <img 
                src="https://via.placeholder.com/120"
                alt="Profile"
                class="profile-avatar"
            >

            <h2 class="profile-name">Juan Pérez</h2>
            <p class="profile-email">juan@email.com</p>
        </div>

        <div class="profile-info">
            <div class="profile-row">
                <span>Rol:</span>
                <span>Administrador</span>
            </div>

            <div class="profile-row">
                <span>Miembro desde:</span>
                <span>2024</span>
            </div>
        </div>

        <button class="profile-edit-btn">
            Editar perfil
        </button>

    </div>
  `;

  return container;
}