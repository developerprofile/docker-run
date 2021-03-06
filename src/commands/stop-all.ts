import { ProgressLocation, window, commands } from "vscode";

import { getContainersList, ContainerList } from "../common/list";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";

export const disposableStopAll = commands.registerCommand('docker-run.stop:all', async () => {
    const progressOptions = { location: ProgressLocation.Notification, title: 'Stopping All Containers' };

    window.withProgress(progressOptions, (async (progress) => {

        const containerList = await getContainersList(true).catch((error: Error) => {
            handleError(error);
            return [] as ContainerList;
        });

        await ext.stopOperation.operateContainersWithProgress(containerList, progress);

    }));
});
