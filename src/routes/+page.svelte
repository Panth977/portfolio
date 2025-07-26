<script lang="ts">
	import GradientText from '$lib/GradientText.svelte';
	import ProfileCard from '$lib/ProfileCard.svelte';
	import Squares from '$lib/Squares.svelte';
	import { onDestroy, onMount } from 'svelte';
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

	function getAssetsPath(filename: string) {
		return `https://firebasestorage.googleapis.com/v0/b/panth-personal.firebasestorage.app/o/portfolio%2F${filename}?alt=media`;
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
			<ProfileCard
				avatarUrl={getAssetsPath('ai1.png')}
				handle="PanthPatel"
				status="Cooking{dots}"
				showUserInfo={true}
				enableTilt={true}
				onContactClick={openPopup}
			/>
		</div>
		<p class="mt-10 text-center text-2xl sm:text-4xl">
			<span class="italic">Another</span>
			<a class="pink-link" href="https://react.dev/">
				<img src={getAssetsPath('react-logo.svg')} alt="react" class="inline h-5 sm:h-9" /> React
			</a>
			Website 🥱?
			<br /> Maybe some
			<a class="pink-link" href="https://reactbits.dev/" aria-label="React Bits">
				<img
					src={getAssetsPath('react-bits-logo.svg')}
					alt="react-bits"
					class="inline h-5 sm:h-9"
				/>
			</a>
			again?
		</p>
		<div class="mt-10 text-center">
			<a
				href="https://github.com/Panth977/portfolio"
				class="pink-link mt-15 pb-1 text-center text-base"
			>
				Hard Pass
				<img src={getAssetsPath('github-logo.svg')} alt="react-bits" class="ml-1 inline h-6" />
			</a>
		</div>
	</div>
</div>
<!-- <div class="w-full border border-dashed border-[deeppink] opacity-30"></div> -->
<div class="page-block space-y-10 p-4 font-stretch-75% md:px-10">
	<h2 class="text-center text-4xl sm:text-5xl md:text-7xl">😏 Naah Bro!</h2>
	<p class="text-center text-3xl text-gray-500 sm:text-4xl md:text-6xl">
		This one's built using
		<a class="pink-link" href="https://svelte.dev/" aria-label="Svelte">
			<img src={getAssetsPath('svelte-logo.svg')} alt="Svelte" class="inline h-10 sm:h-14" />
		</a>
	</p>
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
		<div>
			<span class="text-lg text-[deeppink] selection:bg-white md:text-2xl">
				Langages & Runtimes:
			</span>
			<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">
				<img
					src={getAssetsPath('JavaScript-logo.png')}
					alt="JS"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
			<a href="https://www.typescriptlang.org/">
				<img
					src={getAssetsPath('Typescript-logo.svg')}
					alt="TS"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
			<a href="https://nodejs.org/en">
				<img
					src={getAssetsPath('nodejs-logo.svg')}
					alt="Node.js"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
			<a href="https://deno.com/">
				<img
					src={getAssetsPath('deno-logo.svg')}
					alt="Deno"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
			<a href="https://go.dev/">
				<img
					src={getAssetsPath('GoLang-logo.svg')}
					alt="GoLang"
					class="mx-0.5 inline h-14 sm:h-16 md:h-20"
				/>
			</a>
			<a href="https://www.python.org/">
				<img
					src={getAssetsPath('python-logo.svg')}
					alt="Python"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
			<a href="https://cran.r-project.org/web/packages/rlang/index.html">
				<img
					src={getAssetsPath('RLang-logo.svg')}
					alt="R"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
			<a href="https://dart.dev/">
				<img
					src={getAssetsPath('dart-logo.svg')}
					alt="Dart"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
		</div>
		<div>
			<span class="text-lg text-[deeppink] selection:bg-white md:text-2xl">Frameworks:</span>
			<a href="https://react.dev/">
				<img
					src={getAssetsPath('react-logo.svg')}
					alt="React"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
				<span class="text-lg md:text-2xl">React</span>
			</a>
			<a href="https://svelte.dev/">
				<img
					src={getAssetsPath('svelte-logo.svg')}
					alt="Svelte"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
			<a href="https://flutter.dev/">
				<img
					src={getAssetsPath('flutter-logo.svg')}
					alt="Flutter"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
			<a href="https://expressjs.com/">
				<img
					src={getAssetsPath('expressjs-logo.svg')}
					alt="ExpressJs"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
			<a href="https://hono.dev/">
				<img
					src={getAssetsPath('hono-logo.svg')}
					alt="Hono"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
				<span class="text-lg md:text-2xl">Hono</span>
			</a>
		</div>
		<div>
			<span class="text-lg text-[deeppink] selection:bg-white md:text-2xl">Database:</span>
			<a href="https://www.postgresql.org/">
				<img
					src={getAssetsPath('PostgreSQL-logo.svg')}
					alt="PostgreSQL"
					class="mx-0.5 inline h-10 sm:h-12 md:h-16"
				/>
			</a>
			<a href="https://cassandra.apache.org/_/index.html">
				<img
					src={getAssetsPath('Cassandra-logo.svg')}
					alt="Cassandra"
					class="mx-0.5 inline h-10 sm:h-12 md:h-16"
				/>
			</a>
			<a href="https://www.influxdata.com/">
				<img
					src={getAssetsPath('Influxdb-logo.svg')}
					alt="Influxdb"
					class="mx-0.5 inline h-4 sm:h-6 md:h-10"
				/>
			</a>
			<a href="https://redis.io/">
				<img src={getAssetsPath('Redis-logo.svg')} alt="Redis" class="mx-0.5 inline h-4 md:h-8" />
			</a>
			<a href="https://www.mongodb.com/">
				<img
					src={getAssetsPath('MongoDB-logo.svg')}
					alt="MongoDb"
					class="mx-0.5 inline h-4 sm:h-6 md:h-10"
				/>
			</a>
			<a href="https://firebase.google.com/docs/firestore">
				<img
					src={getAssetsPath('firestore-logo.svg')}
					alt="Firestore"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
		</div>
		<div>
			<span class="text-lg text-[deeppink] selection:bg-white md:text-2xl">Deployment:</span>
			<a href="https://cloud.google.com/">
				<img
					src={getAssetsPath('Google-Cloud-logo.svg')}
					alt="GCP"
					class="mx-0.5 inline h-4 md:h-8"
				/>
			</a>
			<a href="https://www.digitalocean.com/">
				<img
					src={getAssetsPath('DigitalOcean-logo.svg')}
					alt="DigitalOcean"
					class="mx-0.5 inline h-10 sm:h-12 md:h-16"
				/>
			</a>
			<a href="https://www.docker.com/">
				<img
					src={getAssetsPath('docker-logo.svg')}
					alt="Docker"
					class="mx-0.5 inline h-2 sm:h-4 md:h-8"
				/>
			</a>
			<a href="https://www.portainer.io/">
				<img
					src={getAssetsPath('portainer-logo.png')}
					alt="Portainer"
					class="mx-0.5 inline h-10 sm:h-12 md:h-16"
				/>
			</a>
		</div>
		<div>
			<span class="text-lg text-[deeppink] selection:bg-white md:text-2xl">Utilities:</span>
			<a href="https://nodered.org/">
				<img
					src={getAssetsPath('nodered-logo.svg')}
					alt="NodeRed"
					class="mx-0.5 inline h-10 sm:h-12 md:h-16"
				/>
			</a>
			<a href="https://mqtt.org/">
				<img
					src={getAssetsPath('mqtt-logo.svg')}
					alt="Mqtt"
					class="mx-0.5 inline h-6 sm:h-8 md:h-12"
				/>
			</a>
			<a href="https://kafka.apache.org/">
				<img
					src={getAssetsPath('kafka-logo.png')}
					alt="Kafka"
					class="mx-0.5 inline h-10 bg-white sm:h-8 md:h-12"
				/>
			</a>
		</div>
		<p class="mt-10 text-base">
			<span class="text-3xl text-gray-500 md:text-5xl">SMALL NOTE</span>
			<br />
			<br />
			I like using language that solves our problem, we will use it because I know it well, is not good
			enought answer!
			<br />
			<br />
			I prefer a Framework that <span class="text-[deeppink]">works for me</span>. And noo
			<span class="text-[deeppink]">React has a big ecosystem</span>
			is not good enough argument,
			<span class="text-[deeppink]">JavaScript has even bigger ecosystem then react</span>!
			<br />
			<br />
			ORMs are the worst, there is no standards to them and if you like to optimize your query, you will
			need to learn how to write Query, so No point in investing in ORM, unless your product is just
			bunch of CRUD opt.
			<br />
			<br />
			I am
			<span class="text-[deeppink]">not</span>
			fully driven by
			<span class="text-[deeppink]">developer experience</span>
			. Do you think German Car Engineers were talking about a Engineering experience? They were focused
			on making driving experience! Similarly The Only thing that matters is, Code should look 80% consistent
			looking, Should be easily debugable and learing the basics should not be a huge overhead! Should
			not have too many abstractions within codebase, and most importantly the only experience that really
			matters is
			<span class="text-[deeppink]">User Experience</span>
		</p>
	</div>
</div>
<!-- <div class="w-full border border-dashed border-[deeppink] opacity-30"></div> -->
<div class="page-block space-y-10 p-4 md:px-10">
	<h2 class="text-center text-4xl sm:text-5xl md:text-7xl">Professional Experience</h2>
	<div class="space-y-5">
		<div class="align-bottom sm:flex">
			<a href="https://oizom.com/" aria-label="Oizom">
				<img
					src={getAssetsPath('oizom-logo.png')}
					alt="oizom"
					class="mr-4 mb-4 inline aspect-[210/64] h-12 sm:h-16"
				/>
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
	<div class="w-full border border-dashed border-gray-500"></div>
	<div class="space-y-5">
		<div class="align-bottom sm:flex">
			<a href="https://oizom.com/" aria-label="BeGenuin">
				<img
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
	<div class="w-full border border-dashed border-gray-500"></div>
	<div class="space-y-5">
		<div class="align-bottom sm:flex">
			<a href="https://www.techcrista.com/" aria-label="Tech-Crista">
				<img
					src={getAssetsPath('tech-crista-logo.png')}
					alt="tech-crista"
					class="mr-4 mb-4 inline h-12 sm:h-16"
				/>
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
	<div class="w-full border border-dashed border-gray-500"></div>
	<div class="space-y-5">
		<div class="align-bottom sm:flex">
			<a
				href="https://www.google.com/maps/place/Vardayini+Dairy+Products/data=!4m2!3m1!1s0x0:0x79fb04f0c03021c6?sa=X&ved=1t:2428&ictx=111"
				aria-label="Tech-Crista"
			>
				<img
					src={getAssetsPath('vdp-logo.svg')}
					alt="Vardayini Dairy Products"
					class="mr-4 mb-4 inline h-12 sm:h-16"
				/>
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
</div>
<!-- <div class="w-full border border-dashed border-[deeppink] opacity-30"></div> -->
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
<!-- <div class="w-full border border-dashed border-[deeppink] opacity-30"></div> -->
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
