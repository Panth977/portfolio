<script lang="ts">
	import GradientText from '$lib/GradientText.svelte';
	import { getAssetsPath } from './utils.svelte';
</script>

<div class="space-y-5">
	<div class="align-bottom sm:flex">
		<a href="https://oizom.com/" aria-label="BeGenuin">
			<img
				height={70}
				src={getAssetsPath('begenuin-logo.svg')}
				alt="begenuin"
				class="mr-4 mb-4 inline h-12 sm:h-16"
			/>
		</a>
		<h3>
			<span class="block text-lg sm:text-2xl">May 2023 – Jan 2024 | Ahmedabad, India</span>
			<span class="block text-base font-thin text-gray-500 sm:text-lg">
				Video-Based communities integrations On Android, IOS & Web SDK
			</span>
		</h3>
	</div>
	<h4 class="text-2xl sm:text-4xl">Software Engineer I</h4>
	<ol class="mx-0.5 list-inside list-disc text-base font-light font-stretch-90%">
		<li>
			Optimized 24k lines of code to 19k, adding
			<GradientText>
				<span class="font-mono">10k+</span> lines
			</GradientText>
			of new features.
		</li>
		<li>
			Enhanced database query performance by
			<GradientText>
				<span class="font-mono">70%</span>
			</GradientText>.
		</li>
		<li>
			Revamped a project to support
			<span class="font-mono text-gray-500">5k+</span>
			users/sec with minimal resources
		</li>
		<li>
			Created
			<GradientText>
				<span class="font-mono">5+</span> Dev Tools
			</GradientText>
			to better stream line the developer experience
		</li>
		<li>
			Improving Web Embeded SDK, in React
			<GradientText>
				<span class="font-mono">3x</span> faster
			</GradientText>.
		</li>
	</ol>
</div>
