import * as Dockerode from 'dockerode';
import { DockerOptions } from "dockerode";

import { ext } from "./ext-variables";
import { window, commands, ConfigurationTarget } from 'vscode';
import { DEFAULT_FILE_NAME, AutoAdd, autoAddList, CONFIGURATION } from '../common/constants';
import { AutoGenerateConfigDisabledError, AutoStopNonRelatedDisabledError } from '../common/error';
import { isSettingsDisabled, updateSettings } from '../common/settings';
import { StartOperation, StopNonRelatedOperation, StopOperation} from './operations';

export function initDockerode(options?: DockerOptions) {
    ext.dockerode = new Dockerode(options);
}

export function initContainerOperations() {
    ext.startOperation = new StartOperation();
    ext.stopOperation = new StopOperation();
    ext.stopNonRelatedOperation = new StopNonRelatedOperation();
}

export async function initAutoAdd() {

    if (isSettingsDisabled(CONFIGURATION.DISABLE_AUTO_GENERATE_CONFIG)) {
        throw new AutoGenerateConfigDisabledError('Disabled auto generation of file');
    }

    const selection = await window.showQuickPick(autoAddList, {
        placeHolder: `Do you want to automatically generate ${DEFAULT_FILE_NAME} by Docker Run?`
    });

    if (selection && selection.id) {
        switch (selection.id) {
            case AutoAdd.YES:
                await commands.executeCommand('docker-run.add', true);
                break;
            case AutoAdd.SKIP_WORK_SPACE:
            case AutoAdd.SKIP_GLOBAL:
                const configurationTarget = selection.id === AutoAdd.SKIP_GLOBAL ? ConfigurationTarget.Global : ConfigurationTarget.Workspace;
                await updateSettings(CONFIGURATION.DISABLE_AUTO_GENERATE_CONFIG, true, configurationTarget);
                break;
            case AutoAdd.No:
                break;
        }
    }
}

export async function initAutoStart() {
    await commands.executeCommand('docker-run.start:all');
    
    if (isSettingsDisabled(CONFIGURATION.DISABLE_AUTO_STOP_NON_RELATED)) {
        throw new AutoStopNonRelatedDisabledError('Disabled auto stopping of non related containers');
    }

    await commands.executeCommand('docker-run.stop:non-related');
}