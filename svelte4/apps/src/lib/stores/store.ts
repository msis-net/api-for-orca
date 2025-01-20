//ORCA
import { writable } from 'svelte/store';
let orcaUrl = writable('');
let orcaCertificate = writable('');
let orcaCertPassword = writable('');
let orcaCertExpiry = writable('');
let orcaId = writable('');
let orcaPassword = writable('');

export const Orca = {
	get orcaUrl() {
		return orcaUrl;
	},
	get orcaCertificate() {
		return orcaCertificate;
	},
	get orcaCertPassword() {
		return orcaCertPassword;
	},
	get orcaCertExpiry() {
		return orcaCertExpiry;
	},
	get orcaId() {
		return orcaId;
	},
	get orcaPassword() {
		return orcaPassword;
	},
	setOrcaCertificate(data: string) {
		orcaCertificate.set(data);
	},
	setOrcaCertPassword(data: string) {
		orcaCertPassword.set(data);
	},
	setOrcaCertExpiry(data: string) {
		orcaCertExpiry.set(data);
	},
	setOrcaId(data: string) {
		orcaId.set(data);
	},
	setOrcaPassword(data: string) {
		orcaPassword.set(data);
	},
	setOrcaUrl(data: string) {
		orcaUrl.set(data);
	}
};
