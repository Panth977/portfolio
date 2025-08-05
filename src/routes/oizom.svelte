<script lang="ts">
	import GradientText from '$lib/GradientText.svelte';
	import Img from './img.svelte';
</script>

<div class="space-y-5">
	<div class="align-bottom sm:flex">
		<a href="https://oizom.com/" aria-label="Oizom">
			<Img height={70} src="oizom-logo.png" class="mr-4 mb-4 inline aspect-[210/64] h-12 sm:h-16" />
		</a>
		<h3>
			<span class="block text-lg sm:text-2xl">Feb 2024 – Present | Ahmedabad, India</span>
			<span class="block text-base font-thin text-gray-500 sm:text-lg">
				World’s Leading Air Quality Monitoring IoT Company
			</span>
		</h3>
	</div>
	<h4 class="text-2xl sm:text-4xl">
		Senior Engineer <span class="text-lg text-gray-500 sm:text-2xl">April 2025</span>
	</h4>
	<ol class="mx-0.5 list-inside list-disc text-base font-light font-stretch-90%">
		<li>
			Frontend Lead, Reremping the existing website into
			<GradientText>SvelteKit</GradientText>
			Making things
			<GradientText>
				<span class="font-mono">10x</span>
			</GradientText>
			faster
		</li>
		<li>
			Leading the entire Software Team of
			<GradientText>10 peopel</GradientText>
			including me, Understanding Product Requirements along with
			<GradientText>Task allocation, RnD & POC</GradientText>
		</li>
		<li>
			Weekly
			<GradientText>Know Your Product</GradientText>
			sessions, along with a
			<GradientText>Tech Problem Brainstrom</GradientText>
			for any one to solve and share there findings.
		</li>
		<li>
			Defining a proper
			<GradientText>KYP & KT documents</GradientText>
			to reduce over processing and
			<span class="font-mono text-gray-500">"Figuring out"</span>
			sessions.
		</li>
	</ol>
	<h4 class="text-2xl sm:text-4xl">
		Full Stack Engineer <span class="text-2xl text-gray-500">Feb 2024</span>
	</h4>
	<ol class="mx-0.5 list-inside list-disc text-base font-light font-stretch-90%">
		<li>
			Complete reramp of the backend from scratch, making it
			<GradientText>
				<span class="font-mono">2x</span> faster
			</GradientText>
		</li>
		<li>
			Auto gen
			<span class="text-gray-500">Swagger Docs</span>, Safe garding all apis with strict
			<span class="text-gray-500">I/O schema</span>
		</li>
		<li>
			Rest Api Request wise
			<span class="text-gray-500">Logging system</span>
			using cassandra
		</li>
		<li>
			Cache Postgres Queries and
			<GradientText>Auto Cache Invalidation</GradientText>
			from Postgres triggers
		</li>
		<li>
			Reduce Number Services in use, taking atomic & code control, reducing cost by almost
			<GradientText>
				<span class="font-mono">1,000 USD/yr</span>
			</GradientText>
			.
		</li>
		<li>
			Building Docker & Docker Compose, on
			<span class="text-gray-500">OpenSource</span> Tech for
			<GradientText>Premise Deployables</GradientText>
		</li>
		<li>
			Optimization using
			<span class="text-gray-500">Buffer</span>
			for millions of data points instead of JSON Increasing time performance by
			<GradientText>
				<span class="font-mono">8x</span>
			</GradientText>
			and memory performance by
			<GradientText>
				<span class="font-mono">30x</span>
			</GradientText>
		</li>
		<li>
			A complete reramp of Heatmaps, reducing cost by
			<GradientText>
				<span class="font-mono">500 USD/yr</span>
			</GradientText>
			And changing from
			<span class="text-gray-500">Cron → On The Fly</span>
			architecture. Standardation of simulation schema over API gateways
		</li>
		<li>
			A complete reramp of Display, Reports and Dashboard, from static If/Else conditions to
			<span class="text-gray-500">Drag And Drop</span>
			architecture. Improving all possible Permutations & Combinations for personal needs.
		</li>
	</ol>
</div>
