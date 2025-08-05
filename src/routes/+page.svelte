<script lang="ts">
	import GradientText from '$lib/GradientText.svelte';
	import Squares from '$lib/Squares.svelte';
	import { onMount } from 'svelte';
	import Oizom from './oizom.svelte';
	import { getAssetsPath, dots, generatePreviewUrl } from './utils.svelte';
	import Img from './img.svelte';

	onMount(() => {
		window.addEventListener('keydown', function (event) {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
				event.preventDefault();
				event.stopPropagation();
				window.location.href = getAssetsPath('Panth-Patel-Resume.pdf');
			}
		});
	});
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
	const techstack: { label: string; imgs: { href: string; src: string; alt: string }[] }[] =
		JSON.parse(`[
		{"label": "Langages & Runtimes",
			"imgs": [
				{
					"href": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
					"src": "JavaScript-logo.png",
					"alt": "JS"
				},
				{
					"href": "https://www.typescriptlang.org/",
					"src": "Typescript-logo.svg",
					"alt": "TS"
				},
				{
					"href": "https://nodejs.org/en",
					"src": "nodejs-logo.svg",
					"alt": "Node.js"
				},
				{
					"href": "https://deno.com/",
					"src": "deno-logo.svg",
					"alt": "Deno"
				},
				{
					"href": "https://go.dev/",
					"src": "GoLang-logo.svg",
					"alt": "GoLang"
				},
				{
					"href": "https://www.python.org/",
					"src": "python-logo.svg",
					"alt": "Python"
				},
				{
					"href": "https://cran.r-project.org/web/packages/rlang/index.html",
					"src": "RLang-logo.svg",
					"alt": "R"
				},
				{
					"href": "https://dart.dev/",
					"src": "dart-logo.svg",
					"alt": "Dart"
				}
			]
		},
		{"label": "Frameworks",
			"imgs": [
				{
					"href": "https://react.dev/",
					"src": "react-logo.svg",
					"alt": "React"
				},
				{
					"href": "https://svelte.dev/",
					"src": "svelte-logo.svg",
					"alt": "Svelte"
				},
				{
					"href": "https://flutter.dev/",
					"src": "flutter-logo.svg",
					"alt": "Flutter"
				},
				{
					"href": "https://expressjs.com/",
					"src": "expressjs-logo.svg",
					"alt": "ExpressJs"
				},
				{
					"href": "https://hono.dev/",
					"src": "hono-logo.svg",
					"alt": "Hono"
				}
			]
		},
		{"label": "Database",
			"imgs": [
				{
					"href": "https://www.postgresql.org/",
					"src": "PostgreSQL-logo.svg",
					"alt": "PostgreSQL"
				},
				{
					"href": "https://cassandra.apache.org/_/index.html",
					"src": "Cassandra-logo.svg",
					"alt": "Cassandra"
				},
				{
					"href": "https://www.influxdata.com/",
					"src": "Influxdb-logo.svg",
					"alt": "Influxdb"
				},
				{
					"href": "https://redis.io/",
					"src": "Redis-logo.svg",
					"alt": "Redis"
				},
				{
					"href": "https://www.mongodb.com/",
					"src": "MongoDB-logo.svg",
					"alt": "MongoDb"
				},
				{
					"href": "https://firebase.google.com/docs/firestore",
					"src": "firestore-logo.svg",
					"alt": "Firestore"
				},
				{
					"href": "https://axiom.co/",
					"src": "axiom-logo.svg",
					"alt": "Axiom"
				}
			]
		},
		{"label": "Deployment",
			"imgs": [
				{
					"href": "https://cloud.google.com/",
					"src": "Google-Cloud-logo.svg",
					"alt": "GCP"
				},
				{
					"href": "https://www.digitalocean.com/",
					"src": "DigitalOcean-logo.svg",
					"alt": "DigitalOcean"
				},
				{
					"href": "https://www.docker.com/",
					"src": "docker-logo.svg",
					"alt": "Docker"
				},
				{
					"href": "https://www.portainer.io/",
					"src": "portainer-logo.png",
					"alt": "Portainer"
				}
			]
		},
		{"label": "Utilities",
			"imgs": [
				{
					"href": "https://nodered.org/",
					"src": "nodered-logo.svg",
					"alt": "NodeRed"
				},
				{
					"href": "https://mqtt.org/",
					"src": "mqtt-logo.svg",
					"alt": "Mqtt"
				},
				{
					"href": "https://kafka.apache.org/",
					"src": "kafka-logo.png",
					"alt": "Kafka"
				}
			]
		}
	]`);
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
				<Img skip src="Panth-logo.svg" class="inline h-12 font-mono sm:h-16" />
			</button>
		</h1>
		<h2 class="mt-2 text-center font-mono text-2xl sm:text-4xl">
			<span class="mr-3 italic"> ˈSēnyər </span>Developer
		</h2>
		<div class="mt-10 flex justify-around">
			{#await import('$lib/ProfileCard.svelte')}
				<Img class="profile-img" src="ai1-cheap.png" />
			{:then ProfileCard}
				<ProfileCard.default
					src={generatePreviewUrl(getAssetsPath('ai1-cheap.png'), {
						webp: true,
						height: 500
					})}
					handle="PanthPatel"
					status="Cooking{$dots}"
					showUserInfo={true}
					enableTilt={true}
					onContactClick={openPopup}
				/>
			{:catch}
				<Img class="profile-img" src="ai1-cheap.png" />
			{/await}
		</div>
		<p class="mt-10 text-center text-2xl sm:text-4xl">
			<span class="italic">Another</span>
			<Img src="react-logo.svg" class="inline h-5 sm:h-9" />
			React Website 🥱?
			<br /> Maybe some
			<Img src="react-bits-logo.svg" class="inline h-5 sm:h-9" />
			again?
		</p>
		<div class="mt-10 text-center">
			<p class="text-center text-base text-gray-500">
				This one's built using
				<a class="pink-link" href="https://github.com/Panth977/portfolio" aria-label="Svelte">
					<Img src="svelte-logo.svg" class="inline h-6" />
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
	<div class="page-block space-y-5 p-4 font-mono md:space-y-10 md:px-10">
		<h2 class="text-center text-4xl sm:text-5xl md:text-7xl">Techstack</h2>
		{#each techstack as ele}
			<div>
				<span class="text-lg text-[deeppink] selection:bg-white md:text-2xl">
					{ele.label}:
				</span>
				{#each ele.imgs as img}
					<a href={img.href}>
						<Img src={img.src} class="inline h-6 p-1 sm:h-8 md:h-12" />
					</a>
				{/each}
			</div>
		{/each}
		<div>
			<h4 class="text-3xl text-gray-500 md:text-5xl">SMALL NOTE</h4>
			<p class="text-sm md:text-base">
				I like using languages that <span class="italic">solve problems</span>, not just ones I
				happen to know well.
				<span class="bg-gray-300 text-black">“We’ll use it because I know it”</span> is
				<span class="text-[deeppink]">not a good enough</span>
				reason!
				<br />
				<br />
				I prefer frameworks that
				<span class="text-[deeppink] italic">do the heavy lifting for me</span>. And no—<span
					class="bg-gray-300 text-black">“React has a big ecosystem”</span
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
				<span class="bg-gray-300 text-black">“engineering experience”</span>?
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
			<Img src="jsr-logo.svg" class="inline h-6 sm:h-10" />
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
			<Img src="hashnode-logo.svg" class="inline h-6 sm:h-10" />
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
			<Img src="youtube-logo.png" class="inline h-6 sm:h-10" />
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
				<Img skip src="Panth-logo.svg" class="inline h-12 font-mono sm:h-16" />
			</button>
		</h1>
		<div
			class="border-2 border-pink-900 bg-gray-200 p-10 text-xl text-black font-stretch-75% shadow-lg"
		>
			<ol class="space-y-5">
				<li class="h-9">
					<a href={getAssetsPath('Panth-Patel-Resume.pdf')}>
						<Img src="PDF-icon.svg" class="inline h-8 md:h-9" />
						Resume.pdf
					</a>
				</li>
				<div class="w-full border border-dashed"></div>
				<li class="h-9">
					<a href="https://github.com/Panth977">
						<Img src="github-logo.svg" class="inline h-5" />
						<Img src="GitHub-logo.png" class="inline h-6" />
					</a>
				</li>
				<li class="h-9">
					<a href="https://blogs.whiteloves.in/">
						<Img src="hashnode-logo.svg" class="inline h-5" />
					</a>
				</li>
				<li class="h-9">
					<a href="https://www.linkedin.com/in/panth-patel-447a88240/">
						<Img src="LinkedIn-logo.png" class="inline h-5" />
					</a>
				</li>
				<li class="h-9">
					<a href="https://www.youtube.com/@panthpatel4870">
						<Img src="youtube-logo.png" class="inline h-5" />
					</a>
				</li>
				<div class="w-full border border-dashed"></div>
				<li class="h-9">
					<a href="mailto:ppanth977@gmail.com">
						<Img src="email-icon.svg" class="inline h-6" />
						ppanth977@gmail.com
					</a>
				</li>
				<li class="h-9">
					<a href="tel:+919157338227">
						<Img src="phone-icon.svg" class="inline h-6" />
						+91 91573 38227
					</a>
				</li>
				<li class="h-9">
					<a href="https://wa.me/919157338227">
						<Img src="whatsapp-logo.svg" class="inline h-6" />
						WhatsApp
					</a>
				</li>
				<!-- <li class="h-9">
			<a href="https://www.instagram.com/panth.xyz/">
				<Img src="Instagram-logo.svg" class="inline h-6" />
				Instagram
			</a>
		</li> -->
			</ol>
		</div>
	</div>
</div>

<button class="fixed right-5 bottom-5 z-50" on:click={openPopup}>
	<Img src="communicate.png" class="inline h-17" />
</button>
<a href={getAssetsPath('Panth-Patel-Resume.pdf')} class="fixed right-8 bottom-20 z-50">
	<Img src="PDF-icon.svg" class="inline h-13" />
</a>
<div
	bind:this={popupDiv}
	style="display: {isPopupOpen ? 'block' : 'none'};"
	class="fixed right-5 bottom-5 z-50 border-2 border-pink-900 bg-gray-200 p-2 px-4 text-xl text-black font-stretch-75% shadow-lg"
>
	<ol class="space-y-2">
		<li class="h-9">
			<a href={getAssetsPath('Panth-Patel-Resume.pdf')}>
				<Img src="PDF-icon.svg" class="inline h-9" />
				Resume.pdf
			</a>
		</li>
		<div class="w-full border border-dashed"></div>
		<li class="h-9">
			<a href="https://github.com/Panth977">
				<Img src="github-logo.svg" class="inline h-5" />
				<Img src="GitHub-logo.png" class="inline h-6" />
			</a>
		</li>
		<li class="h-9">
			<a href="https://blogs.whiteloves.in/">
				<Img src="hashnode-logo.svg" class="inline h-5" />
			</a>
		</li>
		<li class="h-9">
			<a href="https://www.linkedin.com/in/panth-patel-447a88240/">
				<Img src="LinkedIn-logo.png" class="inline h-5" />
			</a>
		</li>
		<li class="h-9">
			<a href="https://www.youtube.com/@panthpatel4870">
				<Img src="youtube-logo.png" class="inline h-5" />
			</a>
		</li>
		<div class="w-full border border-dashed"></div>
		<li class="h-9">
			<a href="mailto:ppanth977@gmail.com">
				<Img src="email-icon.svg" class="inline h-6" />
				ppanth977@gmail.com
			</a>
		</li>
		<li class="h-9">
			<a href="tel:+919157338227">
				<Img src="phone-icon.svg" class="inline h-6" />
				+91 91573 38227
			</a>
		</li>
		<li class="h-9">
			<a href="https://wa.me/919157338227">
				<Img src="whatsapp-logo.svg" class="inline h-6" />
				WhatsApp
			</a>
		</li>
		<!-- <li class="h-9">
			<a href="https://www.instagram.com/panth.xyz/">
				<Img src="Instagram-logo.svg" class="inline h-6" />
				Instagram
			</a>
		</li> -->
	</ol>
	<button class="fixed right-8 bottom-7 text-2xl" on:click={closePopup}> ❌ </button>
</div>

<style>
	:global(.profile-img) {
		height: 80svh;
		max-height: 540px;
		display: grid;
		aspect-ratio: 0.718;
	}
	@media (max-width: 480px) {
		:global(.profile-img) {
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
