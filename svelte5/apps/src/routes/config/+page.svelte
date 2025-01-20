<script lang="ts">
	import { onMount } from 'svelte';
	import { Orca } from '$lib/stores/store.svelte';
	import Weborca from './conf_weborca.svelte';

	// 初期値を設定
	import type { PageServerLoad } from './$types';
	const { data } = $props<{ data: PageServerLoad }>();

	$effect(() => {
		const titleElement = document.getElementById('titleLabel') as HTMLSelectElement;
		titleElement.textContent = 'SVELTE5:20250116';
	});

	onMount(async () => {
		//const titleElement = document.getElementById('titleLabel');
		try {
			const config = data;

			// ORCA Information
			if (data.weborca.length > 0) {
				const weborca = data.weborca[0];
				Orca.setOrcaUrl(weborca.url);
				Orca.setOrcaCertificate(weborca.certificate);
				Orca.setOrcaCertPassword(weborca.certPassword);
				Orca.setOrcaCertExpiry(weborca.certExpiry);
				Orca.setOrcaId(weborca.loginId);
				Orca.setOrcaPassword(weborca.loginPassword);
			}

			// ... rest of the config settings ...
			/*
			
			console.log('ORCA:', {
				orcaUrl: Orca.orcaUrl,
				certificate: Orca.orcaCertificate,
				certPassword: Orca.orcaCertPassword,
				certExpiry: Orca.orcaCertExpiry,
				id: Orca.orcaId,
				password: Orca.orcaPassword
			});
			console.log(titleElement);
			*/
		} catch (error) {
			//console.error('Error loading config:', error);
			// エラーハンドリングを追加（例：ユーザーへの通知）
			//alert('設定ファイルの読み込みに失敗しました。');
		}
	});
</script>

<div class="main p-4">
	<!-- ヘッダー -->
	<header class="">
		<div class="absolute px-4">ORCA-API基本設定</div>
		<nav class="flex text-sm">
			<div id="titleLabel" class="flex-auto text-center"></div>

			<div class="rounded-md border p-2">
				<button aria-label="Settings" class="right-0 px-4" onclick={() => window.history.back()}>
					戻る
				</button>
			</div>
		</nav>
	</header>

	<!-- メインコンテンツ -->

	<main class="h-full w-full px-2 py-2">
		<!-- ステータスセクション -->

		<section class=" md:space-x-1">
			<Weborca />
		</section>
	</main>

	<!-- フッター -->
	<footer class="bg-red-50">
		<div class="p-2">
			<div>フッター</div>
		</div>
	</footer>
</div>

<style>
	header,
	footer {
		display: block;
	}

	/*幅が640以上の時*/
	@media (min-width: 640px) {
		footer {
			display: none;
		}
	}
</style>
