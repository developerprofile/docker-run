import { QuickPickItem } from "vscode";
import { ContainerInspectInfo } from "dockerode";

import { getConfig } from './config-utils';
import { ext } from '../core/ext-variables';

export interface ContainerListItem extends QuickPickItem {
    containerId: string;
}

export type ContainerList = Array<ContainerListItem>;

async function getContainerListByContainerIdsAndStatus(containers: string[], isAll: boolean, isRunning?: boolean): Promise<ContainerList> {
    const containersList = [];
    for (let i = 0; i < containers.length; i++) {

        const containerId = containers[i];
        const container = ext.dockerode.getContainer(containerId);
        const containerInfo = await container.inspect();

        if (isAll || containerInfo.State.Running === isRunning) {
            const label = getContainerLabel(containerInfo);
            containersList.push({ label, containerId });
        }
    }
    return containersList;
}

export function getFormattedName(name: string): string {
    return name[0] === '/' ? name.substring(1) : name;
}

export function getContainerLabel(containerInfo: ContainerInspectInfo): string {
    const containerName = getFormattedName(containerInfo.Name);
    const containerImage = containerInfo.Config.Image;
    return `${containerImage} (${containerName})`;
}

export async function getContainersList(isAll: boolean, isRunning?: boolean): Promise<ContainerList> {
    const { containers }: { containers: Array<string> } = await getConfig().catch((error: Error) => {
        throw error;
    });
    return await getContainerListByContainerIdsAndStatus(containers, isAll, isRunning);
}

export async function getAllContainersList(): Promise<ContainerList> {
    const containers = await ext.dockerode.listContainers({ all: true });
    if (!containers) {
        return [];
    }
    return getContainerListByContainerIdsAndStatus(containers.map(container => container.Id.substring(0, 12)), true);
}

export function extractContainerIds(containerList: ContainerList) {
    return containerList.map(containerListItem => containerListItem.containerId);
}