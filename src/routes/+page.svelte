<script lang="ts">
	import GradientText from '$lib/GradientText.svelte';
	import Squares from '$lib/Squares.svelte';
	import { onDestroy, onMount } from 'svelte';
	import Oizom from './oizom.svelte';
	import { getAssetsPath } from './utils';
	import Genuin from './genuin.svelte';
	let frame = 0;
	onMount(() => {
		const i = setInterval(() => {
			frame++;
			frame = frame % 1000;
		}, 500);
		onDestroy(() => {
			clearInterval(i);
		});

		window.addEventListener('keydown', function (event) {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
				event.preventDefault();
				event.stopPropagation();
				window.location.href = getAssetsPath('Panth-Patel-Resume.pdf');
			}
		});
	});
	const mapping: Record<number, string> = { 1: '.', 2: '..', 3: '...', 4: '....', 5: '.....' };
	$: dots = mapping[Math.abs(4 - (frame % 9)) + 1] ?? '.';

	let popupDiv: HTMLDivElement | null = null;
	let isPopupOpen = false;
	function openPopup() {
		if (isPopupOpen) return;
		isPopupOpen = true;
		setTimeout(() => {
			window.addEventListener('click', handleOutsideClick);
			// window.addEventListener('scroll', closePopup, { once: true });
		});
	}
	function closePopup() {
		if (!isPopupOpen) return;
		isPopupOpen = false;
		window.removeEventListener('click', handleOutsideClick);
		// window.removeEventListener('scroll', closePopup);
	}
	function handleOutsideClick(event: MouseEvent) {
		if (popupDiv?.contains(event.target as Node)) return;
		closePopup();
	}
</script>

<svelte:head>
	<title>Meet Panth</title>
</svelte:head>

<div class="relative">
	<div class="absolute z-0 h-full w-full opacity-50">
		<Squares />
	</div>
	<div class="page-block p-4 md:px-10">
		<h1 class="mt-5 text-center text-4xl sm:text-5xl md:text-7xl">
			Meet
			<button class="pink-link cursor-pointer" on:click={openPopup}>
				<img src="Panth-logo.svg" class="inline h-12 font-mono sm:h-16" alt="Panth" />
			</button>
		</h1>
		<h2 class="mt-2 text-center font-mono text-2xl sm:text-4xl">
			<span class="mr-3 italic"> ˈSēnyər </span>Developer
		</h2>
		<div class="mt-10 flex justify-around">
			{#await import('$lib/ProfileCard.svelte')}
				<img class="profile-img" src={getAssetsPath('ai1.png')} alt="Panth Patel" />
			{:then ProfileCard}
				<ProfileCard.default
					avatarUrl={getAssetsPath('ai1.png')}
					handle="PanthPatel"
					status="Cooking{dots}"
					showUserInfo={true}
					enableTilt={true}
					onContactClick={openPopup}
				/>
			{:catch}
				<img class="profile-img" src={getAssetsPath('ai1.png')} alt="Panth Patel" />
			{/await}
		</div>
		<p class="mt-10 text-center text-2xl sm:text-4xl">
			<span class="italic">Another</span>
			<img src={getAssetsPath('react-logo.svg')} alt="react" class="inline h-5 sm:h-9" /> React
			Website 🥱?
			<br /> Maybe some
			<img src={getAssetsPath('react-bits-logo.svg')} alt="react-bits" class="inline h-5 sm:h-9" />
			again?
		</p>
		<div class="mt-10 text-center">
			<p class="text-center text-base text-gray-500">
				This one's built using
				<a class="pink-link" href="https://github.com/Panth977/portfolio" aria-label="Svelte">
					<img src={getAssetsPath('svelte-logo.svg')} alt="Svelte" class="inline h-6" />
				</a>
			</p>
		</div>
	</div>
</div>
<!-- <div class="w-full border border-dashed border-[deeppink] opacity-30"></div> -->
<div class="page-block space-y-10 p-4 font-stretch-75% md:px-10">
	<div class="m-3 text-base font-light sm:text-xl">
		<span class="text-sm sm:text-lg">
			<br /><span class="text-xl sm:text-3xl">B</span>ackend Engineer,
			<br /><span class="text-xl sm:text-3xl">F</span>rontend Engineer,
			<br /><span class="text-xl sm:text-3xl">D</span>atabase Engineer,
			<br /><span class="text-xl sm:text-3xl">A</span>rchtech Engineer,
			<br /><span class="text-xl sm:text-3xl">D</span>ev<span class="text-xl sm:text-3xl">O</span>ps
			Engineer,
			<br /><span class="text-xl sm:text-3xl">P</span>roduct Engineer.
		</span>
		<br />You name it 🧠, Woking in Startups has made me a skillfull candidate!
		<br />
		<br />
		with <span class="text-xl text-[deeppink] selection:bg-white sm:text-3xl">3+ Years</span> of
		experience in designing robust, scalable, and high-performance systems. Expertise in backend
		architecture,
		<span class="text-xl text-[deeppink] selection:bg-white sm:text-3xl">
			Schema & Cache safe APIs
		</span>
		⚡️ infrastructure, handling massive scale—over
		<span class="text-xl text-[deeppink] selection:bg-white sm:text-3xl">5M+ DataPoints</span> on a
		single request and
		<span class="text-xl text-[deeppink] selection:bg-white sm:text-3xl">60M+ Req/day</span>.
		<br />
		<br />
		I can code without any <span class="text-xl sm:text-3xl">GPTs</span> 😂. Infact past few months
		I have been very Driven to Building
		<span class="text-xl text-[deeppink] selection:bg-white sm:text-3xl">
			High Performance Apps
		</span>
		. Using
		<span class="text-xl text-[deeppink] selection:bg-white sm:text-3xl">
			Node.Js, GoLang, SvelteKit,
		</span>
		etc.,. Yes you can very much build high performance with this tech, if you know what you are doing,
		and how APIs work behind the seen.
		<br />
		<br />
		This Days my daily work looks like
		<ol class="mx-0.5 list-inside list-disc text-xl">
			<li>
				<span class="text-xl text-gray-500 selection:bg-white sm:text-3xl">
					Understanding the Requirements
				</span>
				this can be features, performance, or just overall vage features.
			</li>
			<li>
				<span class="text-xl text-gray-500 selection:bg-white sm:text-3xl">
					Solving the Requirement
				</span>
				on whiteboard along with wireframe.
			</li>
			<li>
				<span class="text-xl text-gray-500 selection:bg-white sm:text-3xl">Creating Tasks</span> we use
				zoho projects, but the idea is simple, plan out things.
			</li>
			<li>
				<span class="text-xl text-gray-500 selection:bg-white sm:text-3xl">Assign the Tasks</span> Yes,
				I very mush manage the team as well.
			</li>
			<li>
				<span class="text-xl text-gray-500 selection:bg-white sm:text-3xl">Helping Out</span> till here
				everything is easy, untill coding starts, and my experties comes in help to my colleagues.
			</li>
		</ol>
	</div>
</div>
<!-- <div class="w-full border border-dashed border-[deeppink] opacity-30"></div> -->
<div class="relative">
	<div class="absolute z-0 h-full w-full opacity-50">
		<Squares />
	</div>
	<div class="page-block space-y-10 p-4 font-mono md:px-10">
		<h2 class="text-center text-4xl sm:text-5xl md:text-7xl">Techstack</h2>
		{#await import('./techstack.json')}
			Loading{dots}
		{:then techstack}
			{#each techstack.default as ele}
				<div>
					<span class="text-lg text-[deeppink] selection:bg-white md:text-2xl">
						{ele.label}:
					</span>
					{#each ele.imgs as img}
						<a href={img.href}>
							<img
								src={getAssetsPath(img.src)}
								alt={img.alt}
								class="inline h-6 p-1 sm:h-8 md:h-12"
							/>
						</a>
					{/each}
				</div>
			{/each}
		{/await}
		<div>
			<h4 class="text-3xl text-gray-500 md:text-5xl">SMALL NOTE</h4>
			<p class="text-sm md:text-base">
				I like using languages that <span class="italic">solve problems</span>, not just ones I
				happen to know well.
				<span class=" bg-gray-300 text-black">“We’ll use it because I know it”</span> is
				<span class="text-[deeppink]">not a good enough</span>
				reason!
				<br />
				<br />
				I prefer frameworks that
				<span class="text-[deeppink] italic">do the heavy lifting for me</span>. And no—<span
					class=" bg-gray-300 text-black">“React has a big ecosystem”</span
				>
				isn’t a strong argument. By that logic, we should all just
				<span class="text-[deeppink]">stick to plain JavaScript</span>—it has an even bigger
				ecosystem!
				<br />
				And maybe we should, for a simple form app, I dont need a 50MB webpack optimized react ecosystem,
				just think about it!
				<br />
				<br />
				<span class="text-[deeppink]">ORMs are the worst</span>. There’s no real standard across
				them, and if you care about optimizing queries, you’ll eventually need to learn how to
				<span class="text-[deeppink]">write raw SQL</span>
				anyway. So unless your product is just a bunch of CRUD operations, there’s no point investing
				heavily in an ORM.
				<br />
				<br />
				I’m not fully driven by <span class="text-[deeppink] italic">developer experience</span>. Do
				you think German automotive engineers were obsessed with
				<span class=" bg-gray-300 text-black">“engineering experience”</span>?
				<br />
				No—they were focused on <span class="text-[deeppink] italic">driving experience</span>.
				Similarly, the only experience that truly matters in software is
				<span class="font-bold text-[deeppink]">User Experience</span>.
			</p>
			<p
				class="mt-10 border-r-2 border-b-2 border-yellow-700 bg-gray-300 p-3 text-xs text-black shadow-lg md:text-sm"
			>
				Because at the end of the day, no user is ever going to say,
				<br />
				“Wow, this was built with Svelte!” or “They used an OOP approach—so cool!”
				<br />
				<br />
				User don’t care about the tech stack.
				<br />
				User care about performance, reliability, intuitive design, and a bug-free experience.
				<br />
				That’s what matters to user. Everything else is just an implementation detail.
			</p>
		</div>
	</div>
</div>
<!-- <div class="w-full border border-dashed border-[deeppink] opacity-30"></div> -->
<div class="page-block space-y-10 p-4 md:px-10">
	<h2 class="text-center text-4xl sm:text-5xl md:text-7xl">Professional Experience</h2>
	<Oizom />
	<!-- import Genuin from './genuin.svelte';
	import Techcrista from './techcrista.svelte';
	import Vdp from './vdp.svelte'; -->
	{#await import('./genuin.svelte') then Genuin}
		<div class="w-full border border-dashed border-gray-500"></div>
		<Genuin.default />
	{/await}
	{#await import('./techcrista.svelte') then Techcrista}
		<div class="w-full border border-dashed border-gray-500"></div>
		<Techcrista.default />
	{/await}
	{#await import('./vdp.svelte') then Vdp}
		<div class="w-full border border-dashed border-gray-500"></div>
		<Vdp.default />
	{/await}
</div>
<div class="page-block space-y-10 p-4 md:px-10">
	<h2 class="text-center text-4xl sm:text-5xl md:text-7xl">
		<GradientText>{'<Show Cases />'}</GradientText>
	</h2>
	<div class="border-r-2 border-b-2 border-pink-900 bg-gray-800 shadow-lg">
		<div class="mb-3 block bg-gray-200 px-5 py-3 text-lg text-black sm:text-2xl">
			<img src={getAssetsPath('jsr-logo.svg')} alt="jsr" class="inline h-6 sm:h-10" />
			<a class="pink-link font-stretch-75%" href="https://jsr.io/@panth977"> @panth977 </a>
		</div>
		<ol class="list-inside list-disc px-5 py-3 text-base font-light font-stretch-75%">
			<li>Goal: to making Backend projects easy integratable.</li>
			<li>
				A light wt. package that has cross integrations with zod to make your functions and apis
				runtime schema safe.
			</li>
			<li>Cacheing Techniques to make, it function outputs easy cache</li>
			<li>A Optimized version of Promise</li>
		</ol>
	</div>
	<div class="border-r-2 border-b-2 border-pink-900 bg-gray-800 shadow-lg">
		<div class="mb-3 block bg-gray-200 px-5 py-3 text-lg text-black sm:text-2xl">
			<img src={getAssetsPath('hashnode-logo.svg')} alt="hashnode" class="inline h-6 sm:h-10" />
			<a
				class="pink-link font-stretch-75%"
				href="https://blogs.whiteloves.in/how-i-generated-heatmaps-100x-faster"
			>
				Heatmap x100 faster
			</a>
		</div>

		<ol class="list-inside list-disc px-5 py-3 text-base font-light font-stretch-75%">
			<li>Goal: how do make it faster, cheaper & realtime!</li>
			<li>Project transition Python → Browser JS → Node JS → GoLang</li>
			<li>How to partially memoize and memory effecient JS structures</li>
		</ol>
	</div>
	<div class="border-r-2 border-b-2 border-pink-900 bg-gray-800 shadow-lg">
		<div class="mb-3 block bg-gray-200 px-5 py-3 text-lg text-black sm:text-2xl">
			<img src={getAssetsPath('youtube-logo.png')} alt="youtube" class="inline h-6 sm:h-10" />
			<a
				class="pink-link font-stretch-75%"
				href="https://youtube.com/playlist?list=PLeXF8QGCGNK7MrBOweoDSd6E1L_7upSPV&si=FDVE_6IrqF0m4STB"
			>
				1mil+ DataPonits in NodeJs
			</a>
		</div>
		<ol class="list-inside list-disc px-5 py-3 text-base font-light font-stretch-75%">
			<li>Goal: to make NodeJs functional and optimized for millions of datapoints!</li>
			<li>Making use of Array Buffers to optimize everything</li>
			<li>Hideing away the complexity behind a simple interface</li>
		</ol>
	</div>
</div>
<div class="relative">
	<div class="absolute z-0 h-full w-full opacity-70">
		<Squares />
	</div>
	<div class="page-block z-10 space-y-10 p-4 md:px-10">
		<h1 class="text-center font-mono text-base text-[deeppink]">thanks for taking your time!</h1>
		<h1 class="text-center text-4xl sm:text-5xl md:text-7xl">
			Contact
			<button class="pink-link cursor-pointer" on:click={openPopup}>
				<img src="Panth-logo.svg" class="inline h-12 font-mono sm:h-16" alt="Panth" />
			</button>
		</h1>
		<div
			class="border-2 border-pink-900 bg-gray-200 p-10 text-xl text-black font-stretch-75% shadow-lg"
		>
			<ol class="space-y-5">
				<li class="h-9">
					<a href={getAssetsPath('Panth-Patel-Resume.pdf')}>
						<img src={getAssetsPath('PDF-icon.svg')} alt="PDF" class="inline h-8 md:h-9" />
						Resume.pdf
					</a>
				</li>
				<div class="w-full border border-dashed"></div>
				<li class="h-9">
					<a href="https://github.com/Panth977">
						<img src={getAssetsPath('github-logo.svg')} alt="github" class="inline h-5" />
						<img src={getAssetsPath('GitHub-logo.png')} alt="github" class="inline h-6" />
					</a>
				</li>
				<li class="h-9">
					<a href="https://blogs.whiteloves.in/">
						<img src={getAssetsPath('hashnode-logo.svg')} alt="hash-node" class="inline h-5" />
					</a>
				</li>
				<li class="h-9">
					<a href="https://www.linkedin.com/in/panth-patel-447a88240/">
						<img src={getAssetsPath('LinkedIn-logo.png')} alt="linkedin" class="inline h-5" />
					</a>
				</li>
				<li class="h-9">
					<a href="https://www.youtube.com/@panthpatel4870">
						<img src={getAssetsPath('youtube-logo.png')} alt="youtube" class="inline h-5" />
					</a>
				</li>
				<div class="w-full border border-dashed"></div>
				<li class="h-9">
					<a href="mailto:ppanth977@gmail.com">
						<img src={getAssetsPath('email-icon.svg')} alt="email" class="inline h-6" />
						ppanth977@gmail.com
					</a>
				</li>
				<li class="h-9">
					<a href="tel:+919157338227">
						<img src={getAssetsPath('phone-icon.svg')} alt="phone" class="inline h-6" />
						+91 91573 38227
					</a>
				</li>
				<li class="h-9">
					<a href="https://wa.me/919157338227">
						<img src={getAssetsPath('whatsapp-logo.svg')} alt="phone" class="inline h-6" />
						WhatsApp
					</a>
				</li>
				<!-- <li class="h-9">
			<a href="https://www.instagram.com/panth.xyz/">
				<img src={getAssetsPath("Instagram-logo.svg")} alt="Instagram" class="inline h-6" />
				Instagram
			</a>
		</li> -->
			</ol>
		</div>
	</div>
</div>

<button class="fixed right-5 bottom-5 z-50" on:click={openPopup}>
	<img src={getAssetsPath('communicate.png')} alt="communicate" class="inline h-17" />
</button>
<a href={getAssetsPath('Panth-Patel-Resume.pdf')} class="fixed right-8 bottom-20 z-50">
	<img src={getAssetsPath('PDF-icon.svg')} alt="PDF" class="inline h-13" />
</a>
<div
	bind:this={popupDiv}
	style="display: {isPopupOpen ? 'block' : 'none'};"
	class="fixed right-5 bottom-5 z-50 border-2 border-pink-900 bg-gray-200 p-2 px-4 text-xl text-black font-stretch-75% shadow-lg"
>
	<ol class="space-y-2">
		<li class="h-9">
			<a href={getAssetsPath('Panth-Patel-Resume.pdf')}>
				<img src={getAssetsPath('PDF-icon.svg')} alt="PDF" class="inline h-9" />
				Resume.pdf
			</a>
		</li>
		<div class="w-full border border-dashed"></div>
		<li class="h-9">
			<a href="https://github.com/Panth977">
				<img src={getAssetsPath('github-logo.svg')} alt="github" class="inline h-5" />
				<img src={getAssetsPath('GitHub-logo.png')} alt="github" class="inline h-6" />
			</a>
		</li>
		<li class="h-9">
			<a href="https://blogs.whiteloves.in/">
				<img src={getAssetsPath('hashnode-logo.svg')} alt="hash-node" class="inline h-5" />
			</a>
		</li>
		<li class="h-9">
			<a href="https://www.linkedin.com/in/panth-patel-447a88240/">
				<img src={getAssetsPath('LinkedIn-logo.png')} alt="linkedin" class="inline h-5" />
			</a>
		</li>
		<li class="h-9">
			<a href="https://www.youtube.com/@panthpatel4870">
				<img src={getAssetsPath('youtube-logo.png')} alt="youtube" class="inline h-5" />
			</a>
		</li>
		<div class="w-full border border-dashed"></div>
		<li class="h-9">
			<a href="mailto:ppanth977@gmail.com">
				<img src={getAssetsPath('email-icon.svg')} alt="email" class="inline h-6" />
				ppanth977@gmail.com
			</a>
		</li>
		<li class="h-9">
			<a href="tel:+919157338227">
				<img src={getAssetsPath('phone-icon.svg')} alt="phone" class="inline h-6" />
				+91 91573 38227
			</a>
		</li>
		<li class="h-9">
			<a href="https://wa.me/919157338227">
				<img src={getAssetsPath('whatsapp-logo.svg')} alt="phone" class="inline h-6" />
				WhatsApp
			</a>
		</li>
		<!-- <li class="h-9">
			<a href="https://www.instagram.com/panth.xyz/">
				<img src={getAssetsPath("Instagram-logo.svg")} alt="Instagram" class="inline h-6" />
				Instagram
			</a>
		</li> -->
	</ol>
	<button class="fixed right-8 bottom-7 text-2xl" on:click={closePopup}> ❌ </button>
</div>

<style>
	.profile-img {
		height: 80svh;
		max-height: 540px;
		display: grid;
		aspect-ratio: 0.718;
	}
	@media (max-width: 480px) {
		.profile-img {
			height: 60svh;
			max-height: 380px;
		}
	}
	.pink-link {
		border-bottom: 2px dashed deeppink;
	}
	.page-block {
		margin-inline: auto;
		min-height: 100vh;
		max-width: 960px;
		position: relative;
	}
</style>
