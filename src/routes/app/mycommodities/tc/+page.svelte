<script>
	const creator = 'Panth Patel';
	const appName = 'My Commodities';
</script>

<svelte:head>
	<title>Terms & Conditions - {appName}</title>
	<meta
		name="description"
		content="Read the official Terms and Conditions for My Commodities, created by Panth Patel."
	/>
</svelte:head>

<main class="mx-auto min-h-screen max-w-4xl bg-gray-50 px-6 py-10 leading-relaxed text-gray-800">
	<h1 class="mb-6 text-center text-3xl font-bold">Terms and Conditions</h1>

	<section class="space-y-4">
		<p>
			Welcome to <strong>{appName}</strong>. By using this application, you agree to comply with and
			be bound by the following Terms and Conditions. Please read them carefully before using the
			app.
		</p>

		<h2 class="mt-6 text-xl font-semibold">1. Ownership</h2>
		<p>
			<strong>{appName}</strong> and all its related materials, including source code, design, data
			structures, and APIs, are the intellectual property of <strong>{creator}</strong>.
			Unauthorized copying, distribution, or modification of the app is strictly prohibited.
		</p>

		<h2 class="mt-6 text-xl font-semibold">2. License to Use</h2>
		<p>
			You are granted a limited, non-exclusive, non-transferable license to use this app solely for
			managing your commodities-related business operations. You may not sublicense, resell, or
			distribute the app or its content without explicit written permission from <strong
				>{creator}</strong
			>.
		</p>

		<h2 class="mt-6 text-xl font-semibold">3. Reverse Engineering</h2>
		<p>
			Under no circumstances are you allowed to reverse-engineer, decompile, disassemble, or attempt
			to derive the source code of the app. Any attempt to bypass or manipulate the app’s security
			or functionality is a violation of these terms.
		</p>

		<h2 class="mt-6 text-xl font-semibold">4. Modifications and Redistribution</h2>
		<p>
			Users are not permitted to modify, adapt, translate, or create derivative works of <strong
				>{appName}</strong
			>. The app or any portion thereof may not be sold, rented, leased, or otherwise commercialized
			without prior authorization from <strong>{creator}</strong>.
		</p>

		<h2 class="mt-6 text-xl font-semibold">5. Data and Privacy</h2>
		<p>
			<strong>{appName}</strong> may collect necessary business data for functionality and analytics.
			All data is handled responsibly, and no personal or business data will be shared with third parties
			without your consent, except as required by law.
		</p>

		<h2 class="mt-6 text-xl font-semibold">6. Liability</h2>
		<p>
			<strong>{creator}</strong> shall not be held liable for any damages, losses, or data corruption
			arising from the use or inability to use the app. You are responsible for ensuring regular data
			backups and secure access to your account.
		</p>

		<h2 class="mt-6 text-xl font-semibold">7. Termination</h2>
		<p>
			<strong>{creator}</strong> reserves the right to suspend or terminate your access to
			<strong>{appName}</strong> at any time, without prior notice, if these Terms and Conditions are
			violated.
		</p>

		<h2 class="mt-6 text-xl font-semibold">8. Changes to Terms</h2>
		<p>
			These Terms and Conditions may be updated periodically. Continued use of the app following any
			modifications constitutes acceptance of the new terms.
		</p>

		<h2 class="mt-6 text-xl font-semibold">9. Contact Information</h2>
		<p>
			For questions or permissions, please contact <strong>{creator}</strong> at
			<a href="mailto:ppanth977@gmail.com" class="text-blue-600 underline">ppanth977@gmail.com</a>.
		</p>
	</section>

	<footer class="mt-16 text-center text-sm text-gray-500">
		<p>© {new Date().getFullYear()} {creator}. All rights reserved.</p>
	</footer>
</main>

<style>
	main {
		font-family: system-ui, sans-serif;
	}
</style>
