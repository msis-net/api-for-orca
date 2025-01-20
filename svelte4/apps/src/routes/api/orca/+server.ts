/**
 * ORCA API対応
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import forge from 'node-forge';
import fetch from 'node-fetch';
import https from 'https';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

import { DOMParser, XMLSerializer } from 'xmldom';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ request }) => {
	const url = new URL(request.url);

	//searchParamsを取得
	const searchParams = url.searchParams;
	const params = Object.fromEntries(searchParams.entries());
	const contextPath = params.context;

	//設定値の読み込み
	const weborca = await prisma.weborca.findFirst({
		where: { enable: true }
	});

	const safeLoadConfig = () => {
		if (!weborca) {
			throw new Error('No enabled weborca configuration found');
		}

		return {
			url: weborca.url || '',
			cert: weborca.certBinary || '',
			certPassword: weborca.certPassword || '',
			loginId: weborca.loginId || '',
			loginPassword: weborca.loginPassword || ''
		};
	};
	const config = safeLoadConfig();

	//ORCAリクエスト用のURLを作成
	const ORCAUrl = new URL(config.url);

	if (ORCAUrl.pathname === '/') {
		ORCAUrl.pathname = contextPath;
	} else {
		ORCAUrl.pathname = ORCAUrl.pathname + contextPath;
	}

	// searchParamsの各パラメータをorcaUrlのsearchParamsに追加
	for (const [key, value] of searchParams) {
		if (key !== 'context') ORCAUrl.searchParams.append(key, value);
	}
	//console.log('ORCAUrl', ORCAUrl);
	const orcaCertificate = config.cert;
	const orcaCertPassword = config.certPassword;
	const orcaId = config.loginId;
	const orcaPassword = config.loginPassword;

	if (orcaCertificate.length === 0) {
		// 証明書情報が無い場合は利用しない（オンプレなどのWebOrca）場合として判断する
		const authHeader = 'Basic ' + Buffer.from(`${orcaId}:${orcaPassword}`).toString('base64');
		const headers = {
			'Content-type': 'application/xm',
			Authorization: authHeader
		};

		try {
			// Fetch リクエス
			const response = await fetch(ORCAUrl.href, {
				method: 'GET',
				headers: headers
			});

			if (!response.ok) {
				const data = {
					status: `HTTP error! status: ${response.status}`,
					message: 'check parameters( ? > & )',
					params: params
				};
				return json(data);
			}

			const contentType = response.headers.get('content-type');
			let data;
			if (contentType && contentType.includes('application/json')) {
				data = await response.json();
			} else {
				// XMLの場合もResponseオブジェクトとして返す
				const text = await response.text();
				//JSONに変換
				data = orcaJson(text);
			}
			return json(data);
		} catch (error) {
			console.error('Error:', error);
			throw error;
		}
	} else {
		// 証明書の読み込みと認証方法の区別
		const p12Buffer = orcaCertificate;
		const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(p12Buffer).bytes());
		const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, orcaCertPassword);

		// 証明書とプライベートキーを取得
		const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
		const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
			forge.pki.oids.pkcs8ShroudedKeyBag
		];
		if (!certBags?.[0]?.cert || !keyBags?.[0]?.key) {
			throw new Error('Failed to extract certificate or private key from P12 file');
		}

		const certificate = forge.pki.certificateToPem(certBags[0].cert);
		const privateKey = forge.pki.privateKeyToPem(keyBags[0].key);

		// HTTPS エージェントの設定を修正
		const agent = new https.Agent({
			cert: certificate,
			key: privateKey,
			rejectUnauthorized: false // 開発時のみ。本番環境では true にすることを推奨
		});

		//const requestUrl = orcaUrl + '/api01rv2/patientgetv2?id=' + ptid + '&format=json';
		const authHeader = 'Basic ' + Buffer.from(`${orcaId}:${orcaPassword}`).toString('base64');
		const headers = {
			'Content-type': 'application/xm',
			Authorization: authHeader
		};

		try {
			// Fetch リクエスト
			const response = await fetch(ORCAUrl.href, {
				method: 'GET',
				headers: headers,
				agent: agent
			});

			if (!response.ok) {
				const data = {
					status: `HTTP error! status: ${response.status}`,
					message: 'check parameters( ? > & )',
					params: params
				};
				return json(data);
			}

			const contentType = response.headers.get('content-type');

			let data;
			if (contentType && contentType.includes('application/json')) {
				data = await response.json();
			} else {
				// XMLの場合もResponseオブジェクトとして返す
				const text = await response.text();
				//JSONに変換
				data = orcaJson(text);
			}
			return json(data);
		} catch (error) {
			console.error('Error:', error);
			throw error;
		}
	}
};

export async function POST(request: any) {
	const url = new URL(request.url);
	//console.log(url);
	const searchParams = url.searchParams;
	//ORCAAPI contextパスを取得
	const params = Object.fromEntries(searchParams.entries());
	const contextPath = params.context;

	//設定値の読み込み
	const weborca = await prisma.weborca.findFirst({
		where: { enable: true }
	});

	const safeLoadConfig = () => {
		if (!weborca) {
			throw new Error('No enabled weborca configuration found');
		}

		return {
			url: weborca.url || '',
			cert: weborca.certBinary || '',
			certPassword: weborca.certPassword || '',
			loginId: weborca.loginId || '',
			loginPassword: weborca.loginPassword || ''
		};
	};
	const config = safeLoadConfig();

	//ORCAリクエスト用のURLを作成
	const ORCAUrl = new URL(config.url);

	if (ORCAUrl.pathname === '/') {
		ORCAUrl.pathname = contextPath;
	} else {
		ORCAUrl.pathname = ORCAUrl.pathname + contextPath;
	}

	const body = await request.request.json();

	// searchParamsの各パラメータをorcaUrlのsearchParamsに追加
	// bodyにRequest_Number要素が含まれるか確認
	const requestNumber = body.Request_Number;
	//console.log('Request_Number:', body.hasOwnProperty('Request_Number'));

	if (hasKeyDeep(body, 'Request_Number', 1)) {
		//Request_Numberが優先する為、class要素が含まれる場合は除く
		for (const [key, value] of searchParams) {
			if (key !== 'context' && key !== 'class') ORCAUrl.searchParams.append(key, value);
		}
	} else {
		for (const [key, value] of searchParams) {
			if (key !== 'context') ORCAUrl.searchParams.append(key, value);
		}
	}

	//jsonリクエストをorcaapi形式のXMLに変換する
	const requestbBody = json2Xml(body);
	//console.log('requestbBody', requestbBody);

	const orcaCertificate = config.cert;
	const orcaCertPassword = config.certPassword;
	const orcaId = config.loginId;
	const orcaPassword = config.loginPassword;
	//console.error('ORCAUrl.href:', ORCAUrl.href);
	if (orcaCertificate.length === 0) {
		// 証明書情報が無い場合は利用しない（オンプレなどのWebOrca）場合として判断する
		const authHeader = 'Basic ' + Buffer.from(`${orcaId}:${orcaPassword}`).toString('base64');
		const headers = {
			'Content-type': 'application/xm',
			Authorization: authHeader
		};

		try {
			// Fetch リクエスト
			//console.error('ORCAUrl.href:', ORCAUrl.href);
			//console.error('authHeader:', authHeader);
			const response = await fetch(ORCAUrl.href, {
				method: 'POST',
				headers: headers,
				body: requestbBody
			});

			if (!response.ok) {
				const data = {
					status: `HTTP error! status: ${response.status}`,
					message: 'check parameters( ? > & )',
					params: params
				};
				return json(data);
			}

			const contentType = response.headers.get('content-type');
			let data;
			if (contentType && contentType.includes('application/json')) {
				data = await response.json();
			} else {
				// XMLの場合もResponseオブジェクトとして返す
				const text = await response.text();
				//JSONに変換
				data = orcaJson(text);
			}
			return json(data);
		} catch (error) {
			console.error('Error:', error);
			console.error('body:', body);
			throw error;
		}
	} else {
		// 証明書の読み込みと認証方法の区別
		const p12Buffer = orcaCertificate;
		const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(p12Buffer).bytes());
		const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, orcaCertPassword);

		// 証明書とプライベートキーを取得
		const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
		const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
			forge.pki.oids.pkcs8ShroudedKeyBag
		];
		if (!certBags?.[0]?.cert || !keyBags?.[0]?.key) {
			throw new Error('Failed to extract certificate or private key from P12 file');
		}

		const certificate = forge.pki.certificateToPem(certBags[0].cert);
		const privateKey = forge.pki.privateKeyToPem(keyBags[0].key);

		// HTTPS エージェントの設定を修正
		const agent = new https.Agent({
			cert: certificate,
			key: privateKey,
			rejectUnauthorized: false // 開発時のみ。本番環境では true にすることを推奨
		});

		//const requestUrl = orcaUrl + '/api01rv2/patientgetv2?id=' + ptid + '&format=json';
		const authHeader = 'Basic ' + Buffer.from(`${orcaId}:${orcaPassword}`).toString('base64');
		const headers = {
			'Content-type': 'application/xm',
			Authorization: authHeader
		};

		try {
			// Fetch リクエスト
			const response = await fetch(ORCAUrl.href, {
				method: 'POST',
				headers: headers,
				agent: agent,
				body: requestbBody
			});

			if (!response.ok) {
				const data = {
					status: `HTTP error! status: ${response.status}`,
					message: 'check parameters( ? > & )',
					params: params
				};
				return json(data);
			}

			const contentType = response.headers.get('content-type');
			let data;
			if (contentType && contentType.includes('application/json')) {
				data = await response.json();
			} else {
				// XMLの場合もResponseオブジェクトとして返す
				const text = await response.text();
				//JSONに変換
				data = orcaJson(text);
				//console.log(data);
			}
			return json(data);
		} catch (error) {
			console.error('Detailed error:', error);
			console.error('body:', body);
			throw error;
		}
	}
}

//全体からキーを探す
//目的としているのはRequestNumberが２階層目にあるかどうかだけなのでcountで階層を制御する
function hasKeyDeep(obj: any, key: string, count: number) {
	if (typeof obj !== 'object' || obj === null || count === 2) {
		return false; // オブジェクトではない場合は終了
	}

	if (key in obj) {
		return true; // 現在のオブジェクトにキーが存在する場合
	}

	// 再帰的に子要素を調べる
	for (const k in obj) {
		if (hasKeyDeep(obj[k], key, count++)) {
			return true;
		}
	}

	return false; // 見つからなかった場合
}

/**********************************
 * ORCA_API信処理
 * アプリからのJSONデータをORCA形式のXMLに変換
 **********************************/
// オブジェクトからXMLを構築する関数
// 1.additionalChildElementでjsonに:_childエレメントを追加
// 2.１のJSONからXMLを生成
// 3. 2のXMLにtype＝"*"を追加。この時ORCA仕様に配慮
function json2Xml(json: any) {
	//option参照：https://github.com/chrisbottin/xml-formatter#readme
	// optionの指定：全ての値を文字列に変換：ORCAではtype=stringに固定されている。
	// 配列を加工したデータを生成
	const tmpJson = additionalChildElement(json);
	//console.log('tmpJson', JSON.stringify(tmpJson));

	const builderOptions = {
		ignoreAttributes: false, // 属性を無視しない
		format: true // フォーマット付きで出力
	};

	// XMLを生成
	const builder = new XMLBuilder(builderOptions);
	const xmlString = builder.build(tmpJson);
	//console.log(xmlString);

	// 1. XML文字列をパース
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
	const updateXML = additionalAtrr(xmlDoc);

	// 3. 更新したXMLを文字列に変換
	const serializer = new XMLSerializer();
	const OrcaXml = serializer.serializeToString(updateXML);
	//console.log(OrcaXml);
	return OrcaXml;
}

function additionalChildElement(obj: any) {
	const transformed: { [key: string]: any } = {};

	for (const [key, value] of Object.entries(obj)) {
		if (Array.isArray(value)) {
			transformed[key] = {
				[key + '_child']: value.map((item) =>
					typeof item === 'object' ? additionalChildElement(item) : item
				)
			};
		} else if (typeof value === 'object' && value !== null) {
			transformed[key] = additionalChildElement(value);
		} else {
			transformed[key] = value;
		}
	}

	return transformed;
}

function additionalAtrr(xml: any) {
	//console.log('xml', xml);
	// すべての要素を取得
	const allElements = xml.getElementsByTagName('*');

	// 各要素のタグ名を表示
	for (let i = 0; i < allElements.length; i++) {
		const element = allElements[i];
		const tagName = element.tagName;

		// 要素の値を取得して表示
		const value = element.textContent;

		//子要素の判定
		const childs = element.getElementsByTagName('*');

		// 要素内に値がない場合は削除
		if (!value && !childs.length) {
			element.parentNode?.removeChild(element);
			i--; // インデックスを調整（要素が削除されたため）
			continue; //ループの次のイテレーションに直接ジャンプ
		}
		if (childs.length === 0) {
			element.setAttribute('type', 'string');
		} else if (tagName.endsWith('_child')) {
			element.setAttribute('type', 'record');
		} else {
			if (childs.length > 0 && childs[0].tagName === tagName + '_child') {
				element.setAttribute('type', 'array');
			} else if (tagName !== 'data') {
				element.setAttribute('type', 'record');
			}
		}
	}
	return xml;
}

/**********************************
 * ORCA_API結果処理
 * ORCAからの戻り値XMLをJSONに変換
 **********************************/
function orcaJson(xmlstr: any) {
	// optionの指定：全ての値を文字列に変換：ORCAではtype=stringに固定されている。
	const options = {
		parseTagValue: false // タグ値の型推測を無効化
	};

	const parser = new XMLParser(options);
	const json = parser.parse(xmlstr);

	let res;
	if ('xmlio2' in json) {
		res = json.xmlio2; // xmlio2以下のみを抽出
	} else {
		res = json;
	}

	return removeChildArrays(res); // JSONを再帰的に処理
}

//parser.parse(xmlstr)で作成されたJSONから*_childになっている配列キーを削除する
function removeChildArrays(obj: any, index?: number): any {
	if (index !== undefined) {
		//デバック時にindex=0から始めると何階層目かが確認できる
		console.log(index, '--------------------------');
	}
	// 基本型の場合は処理不要
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}

	// 配列の場合は各要素を再帰的に処理
	if (Array.isArray(obj)) {
		return obj.map((item) => removeChildArrays(item, index !== undefined ? index + 1 : undefined));
	}

	// オブジェクトの場合：シャローコピー（shallow copy）によって元のオブジェクトを保持する
	const result = { ...obj };

	for (const key in result) {
		const objList = result[key];
		if (typeof objList === 'object') {
			const childObj = { ...objList };
			for (const n in objList) {
				if (n.replace(key, '') === '_child') {
					const type = Array.isArray(objList[n]) ? 'array' : typeof objList[n];
					//console.log(key, type);
					//子要素が1つの場合は配列[]ではなくオブジェクト{}になっている場合があるので配列で統一する
					if (type === 'array') {
						result[key] = objList[n];
					} else {
						result[key] = []; //
						result[key][0] = objList[n];
					}
					break;
				}
			}
		}

		result[key] = removeChildArrays(result[key], index !== undefined ? index + 1 : undefined);
	}
	return result;
}
