<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Orca } from '$lib/stores/store';
	export let config;
	let cert: string | null = null;
	onMount(() => {
		const certificateInput = document.getElementById('orcaCertificate') as HTMLInputElement;
		certificateInput.addEventListener('change', certFileHandler);

		const orcaUrl = document.getElementById('orcaUrl') as HTMLInputElement;
		orcaUrl.addEventListener('change', handleUrl);

		const orcaCertPassword = document.getElementById('orcaCertPassword') as HTMLInputElement;
		orcaCertPassword.addEventListener('change', handleCertPassword);

		const orcaCertExpiry = document.getElementById('orcaCertExpiry') as HTMLInputElement;
		orcaCertExpiry.addEventListener('change', handleCertExpiry);

		const orcaId = document.getElementById('orcaId') as HTMLInputElement;
		orcaId.addEventListener('change', handleOrcaId);

		const orcaPassword = document.getElementById('orcaPassword') as HTMLInputElement;
		orcaPassword.addEventListener('change', handleOrcaPassword);

		if (config?.weborca[0]?.certificate) {
			Orca.setOrcaCertificate(config.weborca[0].certificate);
		} else {
			cert = null;
		}
		// クリーンアップ関数
		return () => {
			certificateInput.removeEventListener('change', certFileHandler);
			orcaUrl.removeEventListener('change', handleUrl);
			orcaCertPassword.removeEventListener('change', handleCertPassword);
			orcaCertExpiry.removeEventListener('change', handleCertExpiry);
			orcaId.removeEventListener('change', handleOrcaId);
			orcaPassword.removeEventListener('change', handleOrcaPassword);
		};
	});

	const eventChange = () => {
		const orcaCertName = document.getElementById('orcaCertName');
		if (!orcaCertName) return; // 要素が存在しない場合は処理をスキップ

		try {
			orcaCertName.removeEventListener('click', certFileDeleteHandler);
			orcaCertName.addEventListener('click', certFileDeleteHandler);
			orcaCertName.removeAttribute('for');
			orcaCertName.style.cursor = 'pointer';

			// 文字列を省略する処理
			const maxLength = 20; // 最大文字数
			if (cert && cert.length > maxLength) {
				cert = cert.substring(0, maxLength) + '...';
			}
			orcaCertName.style.whiteSpace = 'nowrap';
			orcaCertName.style.overflow = 'hidden';
			orcaCertName.style.textOverflow = 'ellipsis';
		} catch (e) {
			console.error('Error in eventChange:', e);
		}
	};

	const unsubscribe = Orca.orcaCertificate.subscribe((value) => {
		//console.log('subscrive', value);
		cert = value;
		if (cert) {
			eventChange();
		}
	});

	//cert登録ハンドラ
	const certFileHandler = async (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			const selectedFile = target.files[0];
			const formData = new FormData();
			formData.append('file', selectedFile);
			formData.append('action', 'update');
			formData.append('table', 'weborca'); //未使用
			try {
				// CORSエラー回避のためにヘッダーを追加
				const headers = new Headers();
				headers.append('Access-Control-Allow-Origin', '*');
				headers.append('Access-Control-Allow-Methods', 'POST');
				headers.append('Access-Control-Allow-Headers', 'Content-Type');
				const response = await fetch('?/byteUpload_weborca', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					const result = await response.json();
					if (result.error) {
						throw new Error(result.error);
					}
				}
				//表示を更新
				cert = selectedFile.name;
				Orca.setOrcaCertificate(selectedFile.name);
			} catch (error) {
				console.error('error!:', error);
			}
		}
	};

	// cert削除イベント
	const certFileDeleteHandler = async (event: Event) => {
		const target = event.target as HTMLInputElement;

		const confirm = window.confirm('証明書を削除してもよろしいですか？');
		if (!confirm) return;

		const formData = new FormData();
		formData.append('action', 'delete');
		try {
			const response = await fetch('?/byteUpload_weborca', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const result = await response.json();
			Orca.setOrcaCertificate('');
			cert = null;

			target.setAttribute('for', 'orcaCertificate');
			target.classList.remove('certfile');

			target.removeEventListener('click', certFileDeleteHandler);

			//certificateInputの初期化
			const certificateInput = document.getElementById('orcaCertificate') as HTMLInputElement;
			certificateInput.value = '';
			certificateInput.classList.remove('hidden');
		} catch (error) {
			console.error('error!:', error);
		}
	};

	// イベントハンドラー関数
	const handleUrl = async (event: Event) => {
		const target = event.target as HTMLInputElement;
		Orca.setOrcaUrl(target.value);
		const formData = new FormData();
		formData.append('url', target.value);
		const response = await fetch('?/weborca', {
			method: 'POST',
			body: formData,
			headers: {
				'x-sveltekit-action': 'true', // SvelteKitのアクションであることを示す
				accept: 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
	};

	const handleCertPassword = async (event: Event) => {
		const target = event.target as HTMLInputElement;
		Orca.setOrcaCertPassword(target.value);
		const formData = new FormData();
		formData.append('certPassword', target.value);
		const response = await fetch('?/weborca', {
			method: 'POST',
			body: formData
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
	};

	const handleCertExpiry = async (event: Event) => {
		const target = event.target as HTMLInputElement;
		Orca.setOrcaCertExpiry(target.value);
		const formData = new FormData();
		formData.append('certExpiry', target.value);
		const response = await fetch('?/weborca', {
			method: 'POST',
			body: formData
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
	};

	const handleOrcaId = async (event: Event) => {
		const target = event.target as HTMLInputElement;
		Orca.setOrcaId(target.value);
		const formData = new FormData();
		formData.append('loginId', target.value);
		const response = await fetch('?/weborca', {
			method: 'POST',
			body: formData
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
	};

	const handleOrcaPassword = async (event: Event) => {
		const target = event.target as HTMLInputElement;
		Orca.setOrcaPassword(target.value);
		const formData = new FormData();
		formData.append('loginPassword', target.value);
		const response = await fetch('?/weborca', {
			method: 'POST',
			body: formData
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
	};

	// コンポーネントのクリーンアップ
	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="space-y-4 p-4">
	<div class="label">WebORCA設定</div>
	<div class="flex flex-col">
		<input
			type="text"
			id="orcaUrl"
			name="orcaUrl"
			value={config.weborca[0]?.url ?? ''}
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			placeholder="URL"
		/>
	</div>
	<div class="grid grid-cols-3 gap-4">
		<div class="flex flex-col">
			<label for="orcaCertificate" id="orcaCertName" class="font-medium text-gray-700">
				{#if cert}
					{cert} <span class="text-red-500">[X]</span>
				{:else}
					証明書(.p12)を選択してください。
				{/if}
			</label>
			<input
				type="file"
				id="orcaCertificate"
				name="orcaCertificate"
				accept=".p12"
				class="order-gray-300 mt-1 w-full rounded-md focus:border-blue-500 focus:ring-blue-500"
			/>
		</div>

		<div class="flex flex-col">
			<label for="orcaCertPassword" class=" font-medium text-gray-700">証明書パスワード</label>
			<input
				type="password"
				id="orcaCertPassword"
				name="orcaCertPassword"
				value={config.weborca[0]?.certPassword ?? ''}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				placeholder="証明書のパスワードを入力"
			/>
		</div>

		<div class="flex flex-col">
			<label for="orcaCertExpiry" class=" font-medium text-gray-700">証明書有効期限</label>
			<input
				type="date"
				id="orcaCertExpiry"
				name="orcaCertExpiry"
				value={config.weborca[0]?.certExpiry ?? ''}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			/>
		</div>
	</div>
	<div class="grid grid-cols-2 gap-4">
		<div class="flex flex-col">
			<label for="orcaId" class=" font-medium text-gray-700">ログインID</label>
			<input
				type="text"
				id="orcaId"
				name="orcaId"
				value={config.weborca[0]?.loginId ?? ''}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				placeholder="ログインIDを入力"
			/>
		</div>

		<div class="flex flex-col">
			<label for="orcaPassword" class=" font-medium text-gray-700">パスワード/APIキー</label>
			<input
				type="text"
				id="orcaPassword"
				name="orcaPassword"
				value={config.weborca[0]?.loginPassword ?? ''}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				placeholder="パスワードを入力"
			/>
		</div>
	</div>
</div>

<style>
	#orcaCertificate {
		@apply text-[0.8rem];
	}

	#orcaCertificate::file-selector-button {
		color: dodgerblue;
		padding: 0.5em;
		border: thin solid grey;
		border-radius: 3px;
	}

	input:not([type='file']) {
		@apply bg-slate-100 p-2;
	}
</style>
