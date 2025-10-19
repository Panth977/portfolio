<script lang="ts">
	import { onMount } from 'svelte';
	let data: {
		name: string;
		createTime: string;
		updateTime: string;
		fields: {
			supportEmail: { stringValue: string };
			note: { stringValue: string };
			active: { booleanValue: boolean };
			website: { stringValue: string };
			apkVersion: { stringValue: string };
			apkUrl: { stringValue: string };
			supportNumber: { stringValue: string };
		};
	} | null = $state(null);

	onMount(async () => {
		const res = await fetch(
			'https://firestore.googleapis.com/v1/projects/mycommodities01/databases/(default)/documents/app/v2'
		);
		data = await res.json();
	});

	const screenshots = [
		'/app/mycommodities/ss1.jpeg',
		'/app/mycommodities/ss2.jpeg',
		'/app/mycommodities/ss3.jpeg',
		'/app/mycommodities/ss4.jpeg',
		'/app/mycommodities/ss5.jpeg',
		'/app/mycommodities/ss6.jpeg',
		'/app/mycommodities/ss7.jpeg',
		'/app/mycommodities/ss8.jpeg'
	];
</script>

<svelte:head>
	<title>My Commodities - Business Management App</title>
	<meta
		name="description"
		content="Manage your commodities with ease. Chat with distributors, manage rates, track boxes, and view daily reports in one place."
	/>
</svelte:head>

<main class="flex min-h-screen flex-col items-center bg-gray-50 p-6 text-gray-800">
	<img
		src="/app/mycommodities/logo.png"
		alt="My Commodities Logo"
		class="mb-6 h-32 w-32 rounded-2xl shadow-md"
	/>

	<h1 class="mb-2 text-4xl font-bold">My Commodities</h1>
	<p class="mb-8 max-w-2xl text-center text-lg text-gray-600">
		A smart, chat-style business management app that lets you connect with your distributors and
		sellers — while managing goods, payments, and box returns seamlessly.
	</p>

	<div class="mb-10 flex flex-col gap-4 md:flex-row">
		<a
			href={data?.fields.apkUrl.stringValue}
			target="_blank"
			class="rounded-xl bg-green-600 px-5 py-3 text-white transition hover:bg-green-700"
		>
			Download App (v{data?.fields.apkVersion.stringValue ?? 'X.X.X'})
		</a>
		<a
			href={`tel:${data?.fields.supportNumber.stringValue}`}
			class="rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
		>
			📞 Call Support
		</a>
		<a
			href={`mailto:${data?.fields.supportEmail.stringValue}`}
			class="rounded-xl bg-yellow-500 px-5 py-3 text-white transition hover:bg-yellow-600"
		>
			✉️ Email Us
		</a>
		<a
			href={`https://wa.me/${data?.fields.supportNumber.stringValue.replace(/[^0-9]/g, '')}`}
			target="_blank"
			class="rounded-xl bg-green-500 px-5 py-3 text-white transition hover:bg-green-600"
		>
			💬 WhatsApp
		</a>
		<a
			href="/app/mycommodities/tc"
			class="rounded-xl bg-yellow-600 px-5 py-3 text-white transition hover:bg-yellow-700"
		>
			📜 Terms And Condition
		</a>
	</div>
	<section class="max-w-3xl text-center">
		<h2 class="mb-4 text-2xl font-semibold">Why My Commodities?</h2>
		<ul class="list-inside list-disc space-y-2 text-left text-gray-700">
			<li>WhatsApp-like chat interface to manage distributors and sellers.</li>
			<li>Integrated product, rate, and transaction management.</li>
			<li>Track goods sold, payments made, and boxes returned.</li>
			<li>Invite other users and control what data they can access.</li>
			<li>Daily detailed summary reports to stay on top of your business.</li>
			<li>Fully customizable — contact us for tailored features.</li>
		</ul>
	</section>

	<section class="mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each screenshots as ss}
			<img
				src={ss}
				alt="App Screenshot"
				class="rounded-xl border border-gray-200 shadow-md transition-transform duration-300 hover:scale-105"
			/>
		{/each}
	</section>

	<footer class="mt-20 text-sm text-gray-500">
		<p>
			© {new Date().getFullYear()} My Commodities |
			<a href={data?.fields?.website?.stringValue} class="underline hover:text-gray-700"
				>Official Website</a
			>
		</p>
	</footer>
</main>

<style>
	main {
		font-family: system-ui, sans-serif;
	}
</style>
