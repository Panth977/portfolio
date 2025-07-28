<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="no-print">
	{@render children()}
</div>

<div class="print">
	<div class="bg-white text-black">
		<br />
		<br />
		<br />
		You have requested the PDF version of this page!
		<br />
		This page was not designed or optimized for your request.
		<br />
		<br />
		<br />
		You have a redirct option for your expected request:
		<br />
		<br />
		<br />
		<br />
		<ol>
			<li>
				Checkout the PDF version:
				<a
					href="https://firebasestorage.googleapis.com/v0/b/panth-personal.firebasestorage.app/o/portfolio%2FPanth-Patel-Resume.pdf?alt=media"
					class="underline"
				>
					https://firebasestorage.googleapis.com/v0/b/panth-personal.firebasestorage.app/o/portfolio%2FPanth-Patel-Resume.pdf?alt=media
				</a>
			</li>
			<br />
			<br />
			<br />
			<li>
				Back to website:
				<a class="underline" href="https://panth.whiteloves.in/"> https://panth.whiteloves.in/ </a>
			</li>
		</ol>
	</div>
</div>

<style>
	.print {
		display: none;
	}

	.no-print {
		display: block;
	}
	@media print {
		.print {
			display: block !important;
		}
		.no-print {
			display: none !important;
		}
	}
</style>
