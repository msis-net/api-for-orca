//ORCA
let orcaUrl = $state('');
let orcaCertificate = $state('');
let orcaCertPassword = $state('');
let orcaCertExpiry = $state('');
let orcaId = $state('');
let orcaPassword = $state('');

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
		orcaCertificate = data;
	},
	setOrcaCertPassword(data: string) {
		orcaCertPassword = data;
	},
	setOrcaCertExpiry(data: string) {
		orcaCertExpiry = data;
	},
	setOrcaId(data: string) {
		orcaId = data;
	},
	setOrcaPassword(data: string) {
		orcaPassword = data;
	},
	setOrcaUrl(data: string) {
		orcaUrl = data;
	}
};
