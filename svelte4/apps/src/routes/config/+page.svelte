<script lang="ts">
	import { onMount } from 'svelte';
	import Weborca from './conf_weborca.svelte';

	export let data;
	const { config } = data;

	onMount(async () => {
		// ORCA Information
		const titleElement = document.getElementById('titleLabel') as HTMLSelectElement;
		titleElement.textContent = 'SVELTE4:20250116';
	});
</script>

<!--pre>
{JSON.stringify(data, null, 2)}
</pre-->
<div class="main p-4">
	<!-- ヘッダー -->
	<header class="">
		<nav class="flex text-sm">
			<div class="absolute px-4">ORCA-API基本設定</div>
			<div id="titleLabel" class="flex-auto text-center" />
			<div class="p-2 border rounded-md">
				<button aria-label="Settings" class="right-0 px-4" on:click={() => window.history.back()}>
					戻る
				</button>
			</div>
		</nav>
	</header>

	<!-- メインコンテンツ -->

	<main class="h-full w-full p-2">
		<!-- ステータスセクション -->

		<section class=" md:space-x-1">
			<Weborca {config} />
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
