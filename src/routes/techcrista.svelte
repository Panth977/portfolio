<script lang="ts">
	import GradientText from '$lib/GradientText.svelte';
	import Img from './img.svelte';
</script>

<div class="space-y-5">
	<div class="align-bottom sm:flex">
		<a href="https://www.techcrista.com/" aria-label="Tech-Crista">
			<Img height={70} src="tech-crista-logo.png" class="mr-4 mb-4 inline h-12 sm:h-16" />
		</a>
		<h3>
			<span class="block text-lg sm:text-2xl">Oct 2022 – Feb 2023 | Remote</span>
			<span class="block text-base font-thin text-gray-500 sm:text-lg">
				Overseas Service Based Company
			</span>
		</h3>
	</div>
	<h4 class="text-2xl sm:text-4xl">Junior Developer</h4>
	<ol class="mx-0.5 list-inside list-disc text-base font-light font-stretch-90%">
		<li>
			Developed
			<GradientText>
				<span class="font-mono">35+</span> bots
			</GradientText>
			for various actions and web scraping, including
			<GradientText>
				<span class="font-mono">10+</span> SSO
			</GradientText>
			login bots.
		</li>
		<li>
			Optimized bot login, making things
			<GradientText>
				<span class="font-mono">4x</span> faster
			</GradientText>, cutting down the process from
			<span class="text-gray-500">5min → 1min</span>.
		</li>
		<li>
			Creating a new bot
			<span class="text-gray-500"> Code Design </span>
			standard detect & process approach, reducing code by
			<GradientText>
				<span class="font-mono">30%</span>
			</GradientText>.
		</li>
		<li>
			Standardized bot-client communication using
			<GradientText>"Server Driven UI"</GradientText>
			simplifying from
			<span class="text-gray-500"> 50 → 4 cases </span>.
		</li>
	</ol>
</div>
