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

import {
	createAsyncThunk,
	createSlice,
} from "@reduxjs/toolkit";

import {
	IApiAsyncThunkConfig,
} from "./slices-types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NavigationState {}

const initialState: NavigationState = {};

const prefix = "navigation";

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

export const openUrlInNewTab = createAsyncThunk<void, string, IApiAsyncThunkConfig>(
	`${prefix}/openUrlInNewTab`,
	async (url, thunkApi) => {
		await thunkApi.extra.openUrlInNewTab(url);
	},
);

export const openShortKeysConfiguration = createAsyncThunk<void, void, IApiAsyncThunkConfig>(
	`${prefix}/openShortKeysConfiguration`,
	async (_, thunkApi) => {
		await thunkApi.extra.openShortKeysConfiguration();
	},
);

export const openOptionsPage = createAsyncThunk<void, void, IApiAsyncThunkConfig>(
	`${prefix}/openOptionsPage`,
	async (_, thunkApi) => {
		await thunkApi.extra.openOptionsPage();
	},
);

export const navigationSlice = createSlice({
	initialState,
	name: prefix,
	reducers: {},
});

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types */

// export const {} = navigationSlice.actions;
export default navigationSlice.reducer;
