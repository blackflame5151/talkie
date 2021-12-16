/*
This file is part of Talkie -- text-to-speech browser extension button.
<https://joelpurra.com/projects/talkie/>

Copyright (c) 2016, 2017, 2018, 2019, 2020, 2021 Joel Purra <https://joelpurra.com/>

Talkie is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Talkie is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Talkie.  If not, see <https://www.gnu.org/licenses/>.
*/

import toolkit from "@reduxjs/toolkit";
const {
	createAsyncThunk,
	createSlice,
} = toolkit;
import type {
	Draft,
	PayloadAction,
} from "@reduxjs/toolkit";
import {
	IApiAsyncThunkConfig,
} from "@talkie/shared-ui/slices/slices-types.mjs";
import {
	isLanguageGroup,
} from "@talkie/shared-application-helpers/transform-voices.mjs";

import type {
	OptionsRootState,
} from "../store/index.mjs";
import { getFirstLanguageForSelectedLanguageGroup, getFirstVoiceForSelectedLanguageCode, getIsSelectedLanguageGroupTalkieLocale, getLanguageCountForSelectedLanguageGroup, getSampleTextForLanguageGroup, getSelectedLanguageCode, getSelectedLanguageGroup, getSelectedVoiceName, getVoiceCountForSelectedLanguageCode } from "../selectors/voices.mjs";
import { TalkieLocale, LanguageTextDirection, DefaultLanguageDirection } from "@talkie/shared-interfaces/italkie-locale.mjs";

interface StoreEffectiveVoiceNameForLanguageArguments {
	languageCodeOrGroup: string;
	voiceName: string;
}

export interface VoicesState {
	// TODO: split slice to languages/language/dialects/dialect/voices/voice.
	effectiveVoiceNameForSelectedLanguageCode: string | null;
	effectiveVoiceNameForSelectedLanguageGroup: string | null;
	isSelectedLanguageGroupTalkieLocale: boolean;
	pitchForSelectedVoice: number;
	rateForSelectedVoice: number;
	sampleTextForLanguageGroup: string | null;
	selectedLanguageCode: string | null;
	selectedLanguageGroup: string | null;
	selectedVoiceName: string | null;
	textDirectionForSelectedLanguageGroup: LanguageTextDirection;
}

const initialState: VoicesState = {
	effectiveVoiceNameForSelectedLanguageCode: null,
	effectiveVoiceNameForSelectedLanguageGroup: null,
	isSelectedLanguageGroupTalkieLocale: false,
	pitchForSelectedVoice: 1,
	rateForSelectedVoice: 1,
	sampleTextForLanguageGroup: null,
	selectedLanguageCode: null,
	selectedLanguageGroup: null,
	selectedVoiceName: null,
	textDirectionForSelectedLanguageGroup: DefaultLanguageDirection,
};

const prefix = "voices";

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

export const loadSelectedLanguageCode = createAsyncThunk<void, string | null, IApiAsyncThunkConfig>(
	`${prefix}/loadSelectedLanguageCode`,
	async (languageCode, {dispatch,getState}) => {
		{
			// TODO: separate slices to avoid having to repeatedly check/verify/validate state.
			// TODO: re-architecture to avoid getState() in action -- in particular when also directly/indirectly updating the state in the same call tree.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const selectedLanguageGroup = getSelectedLanguageGroup(getState() as OptionsRootState);

			if(typeof selectedLanguageGroup == "string") {
				if(typeof languageCode === "string"){
					// TODO: better language group/code assertion/validation.
					if(languageCode.length === 0){
						throw new RangeError("languageCode");
					}

					if(!languageCode.startsWith(selectedLanguageGroup)){
						throw new Error("selectedLanguageGroup");
					}
				}
			}
		}

		dispatch(setSelectedLanguageCode(languageCode));
		await dispatch(loadEffectiveVoiceForLanguageCode());

		// TODO: re-architecture to avoid getState() in action -- in particular when also directly/indirectly updating the state in the same call tree.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const voiceCountForSelectedLanguageCode = getVoiceCountForSelectedLanguageCode(getState() as OptionsRootState);
		const voice = voiceCountForSelectedLanguageCode === 1
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			? getFirstVoiceForSelectedLanguageCode(getState() as OptionsRootState)
			: null;
		const voiceName = voice?.name ?? null;

		await dispatch(loadSelectedVoiceName(voiceName));
	},
);

export const loadSelectedLanguageGroup = createAsyncThunk<void, string | null, IApiAsyncThunkConfig>(
	`${prefix}/loadSelectedLanguageGroup`,
	async (languageGroup, {dispatch, getState}) => {
		dispatch(setSelectedLanguageGroup(languageGroup));

		// NOTE: dependent properties load from the selected language group in the state, instead of an argument, to avoid discrepancies.
		// TODO: merge the results into a single object, as the result of this action?
		// TODO: create a slice for the selected language group, including all depdendent properties?
		await dispatch(loadEffectiveVoiceForLanguageGroup());
		await dispatch(loadIsSelectedLanguageGroupTalkieLocale());
		await dispatch(loadTextDirectionForSelectedLanguageGroup());
		await dispatch(loadSampleTextForLanguageGroup());

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const languageCountForSelectedLanguageGroup = getLanguageCountForSelectedLanguageGroup(getState() as OptionsRootState);
		const languageCode = languageCountForSelectedLanguageGroup === 1
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			? getFirstLanguageForSelectedLanguageGroup(getState() as OptionsRootState)
			: null;

		await dispatch(loadSelectedLanguageCode(languageCode));
	},
);

export const loadIsSelectedLanguageGroupTalkieLocale = createAsyncThunk<boolean, void, IApiAsyncThunkConfig>(
	`${prefix}/loadIsSelectedLanguageGroupTalkieLocale`,
	async (_, {extra,getState}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const selectedLanguageGroup = getSelectedLanguageGroup(getState() as OptionsRootState);

		if(typeof selectedLanguageGroup !== "string") {
			return false;
		}

		return extra.isTalkieLocale(selectedLanguageGroup)
	},
);

export const loadTextDirectionForSelectedLanguageGroup = createAsyncThunk<LanguageTextDirection, void, IApiAsyncThunkConfig>(
	`${prefix}/loadTextDirectionForSelectedLanguageGroup`,
	async (_, {extra,getState}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const selectedLanguageGroup = getSelectedLanguageGroup(getState() as OptionsRootState);

		if(typeof selectedLanguageGroup !== "string") {
			return DefaultLanguageDirection;
		}

		const isTalkieLocale = await extra.isTalkieLocale(selectedLanguageGroup);

		if(isTalkieLocale){
			return extra.getBidiDirection(selectedLanguageGroup as TalkieLocale)
		}

		return DefaultLanguageDirection;
	},
);

export const loadSelectedVoiceName = createAsyncThunk<void, string | null, IApiAsyncThunkConfig>(
	`${prefix}/loadSelectedVoiceName`,
	async (voiceName, {dispatch}) => {
		dispatch(setSelectedVoiceName(voiceName));

		if (typeof voiceName === "string") {
			await Promise.all([
				dispatch(loadEffectiveRateForVoice()),
				dispatch(loadEffectivePitchForVoice()),
			]);
		}
	},
);

export const loadEffectiveRateForVoice = createAsyncThunk<number, void, IApiAsyncThunkConfig>(
	`${prefix}/loadEffectiveRateForVoice`,
	async (_, {extra,getState}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const selectedVoiceName = getSelectedVoiceName(getState() as OptionsRootState);

		if(typeof selectedVoiceName === "string"){
			return extra.getEffectiveRateForVoice(selectedVoiceName);
		}

		return initialState.rateForSelectedVoice;
	},
);

export const storeVoiceRateOverride = createAsyncThunk<void, number, IApiAsyncThunkConfig>(
	`${prefix}/storeVoiceRateOverride`,
	async (rate, {dispatch, extra,getState}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const selectedVoiceName = getSelectedVoiceName(getState() as OptionsRootState);

		if(typeof selectedVoiceName !== "string") {
			throw new Error("selectedVoiceName");
		}

		await extra.setVoiceRateOverride(selectedVoiceName, rate);
		dispatch(setRateForSelectedVoice(rate));
		void dispatch(speakInSelectedVoiceNameState());
	},
);

export const loadEffectivePitchForVoice = createAsyncThunk<number, void, IApiAsyncThunkConfig>(
	`${prefix}/loadEffectivePitchForVoice`,
	async (_, {extra,getState}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const selectedVoiceName = getSelectedVoiceName(getState() as OptionsRootState);

		if(typeof selectedVoiceName === "string"){
		return extra.getEffectivePitchForVoice(selectedVoiceName);
		}

		return initialState.pitchForSelectedVoice;
	},
);

export const storeVoicePitchOverride = createAsyncThunk<void, number, IApiAsyncThunkConfig>(
	`${prefix}/storeVoicePitchOverride`,
	async (pitch, {dispatch, extra,getState}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const selectedVoiceName = getSelectedVoiceName(getState() as OptionsRootState);

		if(typeof selectedVoiceName !== "string") {
			throw new Error("selectedVoiceName");
		}
		await extra.setVoicePitchOverride(selectedVoiceName, pitch);
		dispatch(setPitchForSelectedVoice(pitch));
		void dispatch(speakInSelectedVoiceNameState());
	},
);

export const loadEffectiveVoiceForLanguageCode = createAsyncThunk<void, void, IApiAsyncThunkConfig>(
	`${prefix}/loadEffectiveVoiceForLanguageCode`,
	async (_, {dispatch, extra,getState}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const selectedLanguageCode = getSelectedLanguageCode(getState() as OptionsRootState);

		if (typeof selectedLanguageCode === "string") {
			const effectiveVoiceForLanguage = await extra.getEffectiveVoiceForLanguage(selectedLanguageCode);

			dispatch(setEffectiveVoiceNameForSelectedLanguage(effectiveVoiceForLanguage));
		} else {
			dispatch(setEffectiveVoiceNameForSelectedLanguage(null));
		}
	},
);

export const loadEffectiveVoiceForLanguageGroup = createAsyncThunk<void, void, IApiAsyncThunkConfig>(
	`${prefix}/loadEffectiveVoiceForLanguageGroup`,
	async (_, {dispatch, extra,getState}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const selectedLanguageGroup = getSelectedLanguageGroup(getState() as OptionsRootState);

		if (typeof selectedLanguageGroup === "string") {
			const effectiveVoiceForLanguageGroup = await extra.getEffectiveVoiceForLanguage(selectedLanguageGroup);

			dispatch(setEffectiveVoiceNameForSelectedLanguageGroup(effectiveVoiceForLanguageGroup));
		} else {
			dispatch(setEffectiveVoiceNameForSelectedLanguageGroup(null));
		}
	},
);

export const storeEffectiveVoiceNameForLanguage = createAsyncThunk<void, StoreEffectiveVoiceNameForLanguageArguments, IApiAsyncThunkConfig>(
	`${prefix}/storeEffectiveVoiceNameForLanguage`,
	async ({
		languageCodeOrGroup,
		voiceName,
	}, {dispatch, extra}) => {
		await extra.toggleLanguageVoiceOverrideName(languageCodeOrGroup, voiceName);

		// HACK: duplicate function to set either language code or group?
		isLanguageGroup(languageCodeOrGroup)
			? await dispatch(loadEffectiveVoiceForLanguageGroup())
			: await dispatch(loadEffectiveVoiceForLanguageCode());
	},
);

export const loadSampleTextForLanguageGroup = createAsyncThunk<void, void, IApiAsyncThunkConfig>(
	`${prefix}/loadSampleTextForLanguageGroup`,
	async (_, {dispatch,getState,extra}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const selectedLanguageGroup = getSelectedLanguageGroup(getState() as OptionsRootState);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const isTalkieLocale = getIsSelectedLanguageGroupTalkieLocale(getState() as OptionsRootState);

		const sampleTextForLanguageGroup = isTalkieLocale
			? await extra.getSampleText(selectedLanguageGroup as TalkieLocale)
			: null;

		dispatch(setSampleTextForLanguageGroup(sampleTextForLanguageGroup));
	},
);

export const speakInSelectedVoiceNameState = createAsyncThunk<void, void, IApiAsyncThunkConfig>(
	`${prefix}/speakInSelectedVoiceNameState`,
	async (_, {extra,getState}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const selectedVoiceName = getSelectedVoiceName(getState() as OptionsRootState);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const sampleTextForLanguageGroup = getSampleTextForLanguageGroup(getState() as OptionsRootState);

		// TODO: does every property have to have a selector?
		const {
			rateForSelectedVoice,
			pitchForSelectedVoice,
		} = (getState() as OptionsRootState).voices;

		// TODO: move to function/state/selector?
		// NOTE: all logic in the if statement, since typescript's typing doesn't like having a separate boolean variable.
		if (
			typeof sampleTextForLanguageGroup === "string"
			&& sampleTextForLanguageGroup.length > 0
			&& typeof selectedVoiceName === "string"
			&& selectedVoiceName.length > 0
			&& typeof rateForSelectedVoice === "number"
			&& typeof pitchForSelectedVoice === "number"
		) {
			const text = sampleTextForLanguageGroup;
			const voice = {
				name: selectedVoiceName,
				pitch: pitchForSelectedVoice,
				rate: rateForSelectedVoice,
			};

			extra.debouncedSpeakTextInCustomVoice(text, voice);
		}
	},
);

export const voicesSlice = createSlice({
	extraReducers: (builder) => {
		builder
			.addCase(loadIsSelectedLanguageGroupTalkieLocale.fulfilled, (state, action) => {
				state.isSelectedLanguageGroupTalkieLocale = action.payload;
			})
			.addCase(loadTextDirectionForSelectedLanguageGroup.fulfilled, (state, action) => {
				state.textDirectionForSelectedLanguageGroup = action.payload;
			});
	},
	initialState,
	name: prefix,
	reducers: {
		setEffectiveVoiceNameForSelectedLanguage: (state: Draft<VoicesState>, action: PayloadAction<string | null>) => {
			state.effectiveVoiceNameForSelectedLanguageCode = action.payload;
		},
		setEffectiveVoiceNameForSelectedLanguageGroup: (state: Draft<VoicesState>, action: PayloadAction<string | null>) => {
			state.effectiveVoiceNameForSelectedLanguageGroup = action.payload;
		},
		setPitchForSelectedVoice: (state: Draft<VoicesState>, action: PayloadAction<number>) => {
			state.pitchForSelectedVoice = action.payload;
		},
		setRateForSelectedVoice: (state: Draft<VoicesState>, action: PayloadAction<number>) => {
			state.rateForSelectedVoice = action.payload;
		},
		setSampleTextForLanguageGroup: (state: Draft<VoicesState>, action: PayloadAction<string | null>) => {
			state.sampleTextForLanguageGroup = action.payload;
		},
		setSelectedLanguageCode: (state: Draft<VoicesState>, action: PayloadAction<string | null>) => {
			state.selectedLanguageCode = action.payload;
		},
		setSelectedLanguageGroup: (state: Draft<VoicesState>, action: PayloadAction<string | null>) => {
			state.selectedLanguageGroup = action.payload;
		},
		setSelectedVoiceName: (state: Draft<VoicesState>, action: PayloadAction<string | null>) => {
			state.selectedVoiceName = action.payload;
		},
	},
});

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types */

export const {
	setEffectiveVoiceNameForSelectedLanguage,
	setEffectiveVoiceNameForSelectedLanguageGroup,
	setPitchForSelectedVoice,
	setRateForSelectedVoice,
	setSampleTextForLanguageGroup,
	setSelectedLanguageCode,
	setSelectedLanguageGroup,
	setSelectedVoiceName,
} = voicesSlice.actions;
export default voicesSlice.reducer;
