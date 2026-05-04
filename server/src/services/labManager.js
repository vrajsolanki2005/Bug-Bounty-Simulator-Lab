const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');
const docker = new Docker(); // Defaults to local unix socket or windows named pipe

/**
 * LabManager Service
 * Handles the orchestration of isolated Docker environments for users.
 */
class LabManager {
    constructor() {
        this.activeLabs = new Map(); // userId -> { attackBox, targetBox, network, subnet }
    }

    /**
     * Start an isolated lab environment for a user.
     * @param {number} userId 
     * @param {string} challengeSlug 
     */
    async startLab(userId, challengeSlug) {
        if (this.activeLabs.has(userId)) {
            return this.activeLabs.get(userId);
        }

        console.log(`🚀 Starting lab for User ${userId}...`);
        const labId = `lab-${userId}-${uuidv4().substring(0, 8)}`;
        const targetIp = `10.10.${userId % 255}.5`;

        try {
            // Attempt real Docker orchestration
            const network = await docker.createNetwork({
                Name: `${labId}-net`,
                Driver: 'bridge',
                IPAM: { Config: [{ Subnet: `10.10.${userId % 255}.0/24` }] }
            });

            const targetContainer = await docker.createContainer({
                Image: 'vuln-target:latest',
                Name: `${labId}-target`,
                HostConfig: { NetworkMode: `${labId}-net` },
                NetworkingConfig: { EndpointsConfig: { [`${labId}-net`]: { IPAMConfig: { IPv4Address: targetIp } } } }
            });
            await targetContainer.start();

            const labData = {
                labId,
                targetIp,
                type: 'real',
                networkId: network.id,
                targetId: targetContainer.id,
                startTime: new Date()
            };

            this.activeLabs.set(userId, labData);
            return labData;

        } catch (error) {
            console.warn('⚠️ Docker not found or error. Falling back to Simulation Mode...');
            
            // Simulation Fallback
            const labData = {
                labId: `sim-${labId}`,
                targetIp,
                type: 'simulation',
                startTime: new Date()
            };

            this.activeLabs.set(userId, labData);
            return labData;
        }
    }

    async terminateLab(userId) {
        const lab = this.activeLabs.get(userId);
        if (!lab) return;

        console.log(`🛑 Terminating lab for User ${userId}...`);

        if (lab.type === 'real') {
            try {
                const target = docker.getContainer(lab.targetId);
                const network = docker.getNetwork(lab.networkId);
                await target.stop().catch(() => {});
                await target.remove().catch(() => {});
                await network.remove().catch(() => {});
            } catch (error) {
                console.error('❌ Cleanup failed:', error);
            }
        }

        this.activeLabs.delete(userId);
    }

    getLabStatus(userId) {
        return this.activeLabs.get(userId) || null;
    }
}

module.exports = new LabManager();
