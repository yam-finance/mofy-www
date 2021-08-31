<script lang="ts">
	import Protected from '$lib/components/Protected/index.svelte';
	import ProfileForm from '$lib/components/ProfileForm/index.svelte';
</script>

<svelte:head>
	<title>Mofy Profile</title>
</svelte:head>

<Protected>
	<ProfileForm />
</Protected>
