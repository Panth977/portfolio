<script>
	import GradientText from '$lib/GradientText.svelte';
	import Img from './img.svelte';
</script>

<div class="space-y-5">
	<div class="align-bottom sm:flex">
		<a
			href="https://www.google.com/maps/place/Vardayini+Dairy+Products/data=!4m2!3m1!1s0x0:0x79fb04f0c03021c6?sa=X&ved=1t:2428&ictx=111"
			aria-label="Tech-Crista"
		>
			<Img height={70} src="vdp-logo.svg" class="mr-4 mb-4 inline h-12 sm:h-16" />
		</a>
		<h3>
			<span class="block text-lg sm:text-2xl">Oct 2021 – Jul 2022 | Remote</span>
			<span class="block text-base font-thin text-gray-500 sm:text-lg">
				Desi Premium Quality Dairy Products.
			</span>
		</h3>
	</div>
	<h4 class="text-2xl sm:text-4xl">Full Stack Engineer</h4>
	<ol class="mx-0.5 list-inside list-disc text-base font-light font-stretch-90%">
		<li>
			A complete
			<GradientText>Inventory Management</GradientText>
			App, with User with
			<GradientText>Atomic Roles</GradientText>
			.
		</li>
		<li>Cash counter dashboard, Realtime updates, Auto Generated Log Book, Reports</li>
		<li>
			<GradientText>
				Level <span class="font-mono">3</span>
			</GradientText>
			of Hierarchy: Org > Stocks > Cash-Counter
		</li>
		<li>
			Developed a product meeting business needs, saving
			<span class="text-gray-500">
				<span class="font-mono">3</span> hours daily
			</span>
			in company notary processes
		</li>
		<li>
			Designed efficient UIs for rapid data entry, managing
			<GradientText>
				<span class="font-mono">5000+</span> entries
			</GradientText>
			daily.
		</li>
		<li>Created 4 distinct apps addressing various use cases.</li>
	</ol>
</div>
