<script>
function loadSettings() {
  window.loadSettings(true)
}
$: profile = window.timeline?.profile
</script>

<div class="pointer">
  <button class:light={profile} on:click={loadSettings}>{profile ? 'Edit Profile' : 'Settings'}</button>
</div>

