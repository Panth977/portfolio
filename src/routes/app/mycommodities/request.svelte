<script lang="ts">
	let phoneNumber = $state('');
	let name = $state('');
	let reason = $state('');
	let isSubmitting = $state(false);
	let submissionStatus = $state('');
	let submitted = $state(false);

	const meta: { type: string; title: string } = $props();
	const firestoreUrl =
		'https://firestore.googleapis.com/v1/projects/mycommodities01/databases/(default)/documents/requests';

	function makeid(length: number) {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	async function submitForm(event: Event) {
		event.preventDefault();
		const uniqueId = makeid(15);
		const requestPayload = {
			fields: {
				type: { stringValue: meta.type },
				phoneNumber: { stringValue: phoneNumber },
				name: { stringValue: name },
				reason: { stringValue: reason },
				status: { stringValue: 'Pending' },
				submittedAt: { timestampValue: new Date().toISOString() }
			}
		};

		isSubmitting = true;
		submissionStatus = '';
		submitted = false;

		try {
			const response = await fetch(`${firestoreUrl}/${uniqueId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestPayload)
			});

			if (!response.ok) {
				throw new Error('Failed to submit the request');
			}

			submissionStatus =
				'Your request has been submitted. You will be contacted via WhatsApp or Telecommunication.';
			submitted = true;
		} catch (error) {
			submissionStatus = `Error: ${(error as any)?.message}`;
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>My Commodities: {meta.title}</title>
</svelte:head>

<div class="form-container">
	{#if !submitted}
		<h2>{meta.title}</h2>
		<form onsubmit={submitForm}>
			<label for="phoneNumber">Phone Number:</label>
			<input
				id="phoneNumber"
				type="text"
				bind:value={phoneNumber}
				placeholder="Enter your phone number"
				required
			/>

			<label for="name">Your Name:</label>
			<input id="name" type="text" bind:value={name} placeholder="Enter your full name" required />

			<label for="reason">Reason:</label>
			<textarea
				id="reason"
				bind:value={reason}
				placeholder="Why would you like to delete your account?"
				required
			></textarea>

			<div class="disclaimer">
				By submitting this form, a request ticket will be raised, and you will be contacted via
				WhatsApp or Telecommunication for further action.
			</div>

			<button type="submit" disabled={isSubmitting}>
				{isSubmitting ? 'Submitting...' : 'Submit Request'}
			</button>
		</form>
	{:else}
		<div class="success">
			<svg class="checkmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
				<circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
				<path class="checkmark__check" fill="none" d="M14 27l7 7 16-16" />
			</svg>

			<h3>Request Submitted!</h3>
			<p>
				Please wait while our support team reviews your request.<br />We’ll reach out via WhatsApp
				or phone shortly.
			</p>
		</div>
	{/if}

	<div class="status">
		{#if submissionStatus}
			<p>{submissionStatus}</p>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		background-color: wheat;
		color: black;
		padding-top: 30px;
		font-family: system-ui, sans-serif;
	}

	.form-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 20px;
		background-color: #f9f9f9;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	h2 {
		margin-bottom: 20px;
	}

	label {
		font-size: 16px;
		display: block;
		margin-bottom: 8px;
		text-align: left;
	}

	input,
	textarea {
		width: 100%;
		padding: 10px;
		margin-bottom: 20px;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	button {
		width: 100%;
		padding: 12px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
		transition: background 0.2s ease;
	}

	button:hover:not(:disabled) {
		background-color: #0056b3;
	}

	button:disabled {
		background-color: #ddd;
		cursor: not-allowed;
	}

	.disclaimer {
		font-size: 12px;
		color: #777;
		margin-top: 10px;
		text-align: left;
	}

	.status {
		margin-top: 20px;
		font-weight: bold;
	}

	.success {
		text-align: center;
		padding: 40px 20px;
	}

	.checkmark {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		display: inline-block;
		stroke-width: 3;
		stroke: #4caf50;
		stroke-miterlimit: 10;
		margin-bottom: 20px;
	}

	.checkmark__circle {
		stroke-dasharray: 166;
		stroke-dashoffset: 166;
		stroke-width: 3;
		stroke-miterlimit: 10;
		stroke: #4caf50;
		fill: none;
		animation: stroke 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
	}

	.checkmark__check {
		transform-origin: 50% 50%;
		stroke-dasharray: 48;
		stroke-dashoffset: 48;
		stroke: #4caf50;
		stroke-width: 3;
		animation: stroke 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
	}

	@keyframes stroke {
		100% {
			stroke-dashoffset: 0;
		}
	}
</style>
