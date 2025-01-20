<div class="space-y-4 p-4">
	<section class="hedda">
		<h1 class="text-[2.4rem]">Welcome to OrcaAPI for HeXEHRS</h1>
	</section>
	<section class="body">
		<div>
			<div class="text-[1.2rem] font-bold">基本的な使い方</div>
			<div>
				１．最初に<a href="/config" class="text-blue-600">こちらのページで設定</a>を行ってください。
			</div>

			<div>２．本APIへリクエストを送信する際の基本仕様は以下の通りです。</div>
			<div>
				詳細は<a
					href="https://www.orca.med.or.jp/receipt/tec/api/index.html"
					target="_blank"
					class="text-blue-500"
					>日医標準レセプトソフト API(以下<span class="font-bold">API仕様書</span>)</a
				>の実装仕様を参照してください。
			</div>
			<div>
				<span class="font-bold"
					>エンドポイント :
				</span>api/orca（例：https(s)://ホストアドレス/api/orca
			</div>
			<div class="text-[1.2rem] font-bold">パラメータ</div>
			<ol class="list-decimal space-y-2 pl-6">
				<li>
					<div>context=&ltAPI仕様書のリクエストURL&gt</div>
					<div>
						<div>
							例: <a
								href="https://www.orca.med.or.jp/receipt/tec/api/patientget.html"
								target="_blank"
								rel="noopener noreferrer"
								class="underline"
							>
								<span class="font-bold text-green-600">[GET]</span>
								patientgetV2(患者基本情報の取得)
							</a>
						</div>
						<div>
							http://1.2.3.4:3000/api/orca?<span class="font-bold text-red-600">context</span>=<span
								class="font-bold text-blue-600">/api01rv2/patientgetv2&id=1&format=json</span
							>
						</div>
						<div>※ <span class="text-blue-600">青字部分</span> はAPI仕様書のコンテキストパス</div>
					</div>
				</li>
				<li>
					<span class="font-bold text-orange-600">[POST]</span>
					の場合はリクエストXMLをJSONに変換したものをbodyで送信
					<div>
						例: <a
							href="https://www.orca.med.or.jp/receipt/tec/api/disease.html"
							target="_blank"
							rel="noopener noreferrer"
							class="underline"
						>
							<span class="font-bold text-green-600">[GET]</span>
							diseasegetv2（患者病名情報の返却）
						</a>
					</div>
					<div>
						http://1.2.3.4:3000/api/orca?<span class="font-bold text-red-600">context</span>=<span
							class="font-bold text-blue-600">/api01rv2/diseasegetv2&class=01</span
						>
					</div>
					<div class="flex space-x-4">
						<div class="flex-auto">
							<pre class="h-full flex-auto rounded-md bg-gray-100 px-4">body
<code>
{`{
    "data": {
      "disease_inforeq": {
        "Patient_ID": "1",
        "Base_Date": "2025-01"
      }
    }
}`}
</code>
</pre>
						</div>
						<div class="flex-auto">
							<pre class=" h-full flex-auto rounded-md bg-gray-100 px-4">API仕様書のXML
<code>
&lt;data&gt;
    &lt;disease_inforeq type="record"&gt;
        &lt;Patient_ID type="string"&gt;000001&lt;/Patient_ID&gt;                            
        &lt;Base_Date type="string"&gt;2025-01&lt;/Base_Date&gt;
    &lt;/disease_inforeq&gt;
&lt;/data&gt;
</code>
</pre>
						</div>
					</div>
				</li>
			</ol>
		</div>
	</section>
	<div>2025@(C)Msis,inc.</div>
</div>
