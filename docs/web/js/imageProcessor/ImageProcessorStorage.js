class CostManager {
    constructor(maxCostPercents = 80) {
        this.maxCostPercents = maxCostPercents; // Max allowed cost as a percentage
        this.currentCost = 0; // Current accumulated cost
        this.recentlyUsed = []; // Stack of recently used processor names
    }

    /**
     * Track the cost of a newly initialized processor
     * @param {ImageProcessor} processor
     */
    trackCost(processor) {
        const cost = processor.getCost();
        this.currentCost += cost;
    }

    /**
     * Mark a processor as recently used
     * @param {string} name - Processor name
     */
    markAsRecentlyUsed(name) {
        // Remove name if it already exists in the stack
        this.recentlyUsed = this.recentlyUsed.filter(item => item !== name);
        // Add to the top of the stack
        this.recentlyUsed.push(name);
    }

    /**
     * Ensure memory usage is within the allowed limit
     * @param {Map<string, ImageProcessor>} processors
     */
    async ensureWithinCostLimit(processors) {
        const totalCost = Array.from(processors.values()).reduce(
            (sum, processor) => sum + processor.getCost(),
            0
        );

        const maxAllowedCost = (totalCost * this.maxCostPercents) / 100;

        while (this.currentCost > maxAllowedCost) {
            await this.freeLeastUsedProcessor(processors);
        }
    }

    /**
     * Free memory by releasing the least recently used processor
     * @param {Map<string, ImageProcessor>} processors
     */
    async freeLeastUsedProcessor(processors) {
        if (this.recentlyUsed.length === 0) {
            console.warn("No processors available to free memory.");
            return;
        }

        const leastUsedName = this.recentlyUsed.shift(); // Remove least recently used
        const processor = processors.get(leastUsedName);

        if (processor && processor.isInitialized()) {
            this.currentCost -= processor.getCost();
            await processor.release(); // Release memory
        }
    }
} // End of CostManager

export default class ImageProcessorStorage {
    constructor(
        processorsConfig = [],
        maxCostPercents = 80

    ) {
        this.processors = new Map();
        this.costManager = new CostManager(maxCostPercents);  // @TODO: CostManager se zatím moc nepoužívá
        
        this.registerProcessorsFromConfig(processorsConfig);
    }

    /**
     * Dynamically register processors from configuration
     * @param {Array<Object>} processorsConfig - List of processor configurations
     */
    registerProcessorsFromConfig(processorsConfig) {
        for (const { name, className, dir } of processorsConfig) {
            if (!name || !className || !dir) {
                console.warn(`Invalid processor configuration: ${JSON.stringify({ name, className, dir })}`);
                continue;
            }
            this.addProcessor(name, { className, dir });
        }
    }

    addProcessor(name, processor) {
        if (this.processors.has(name)) {
            throw new Error(`Processor with name "${name}" already exists.`);
        }
        this.processors.set(name, processor);
    }

    async initializeProcessor(name) {
        let processor = this.processors.get(name);
    
        if (!processor) {
            throw new Error(`Processor with name "${name}" not found.`);
        }
    
        // Pokud je uložená hodnota konfigurace, dynamicky ji načteme
        if (processor.className) {
            const { className, dir } = processor;
    
            try {
                const module = await import(`${dir}/${className}.js`);
                const ProcessorClass = module.default;
                processor = new ProcessorClass();
                this.processors.set(name, processor); // Nahradíme konfiguraci instancí
                processor.registerCost?.(); // Volitelné registrování ceny, pokud metoda existuje
            } catch (error) {
                throw new Error(`Failed to dynamically import class "${className}": ${error.message}`);
            }
        }
    
        // Inicializace procesoru (pokud ještě nebyl inicializován)
        if (!processor.isInitialized()) {
            await processor.init();
        }
    
        return processor;
    }
    

    /**
     * Dynamically import and initialize a processor
     * @param {string} name
     * @returns {Promise<ImageProcessor>}
     */
    async getProcessor(name) {
        const processor = await this.initializeProcessor(name);
        //this.costManager?.markAsRecentlyUsed(name); // Aktualizace CostManageru
        return processor;
    }
    
    async initOnBackground() {
        const promises = [];
    
        for (const name of this.processors.keys()) {
            promises.push(
                (async () => {
                    try {
                        await this.initializeProcessor(name);
                        console.log(`Processor "${name}" initialized in background.`);
                    } catch (error) {
                        console.error(`Failed to initialize processor "${name}" in background:`, error);
                    }
                })()
            );
        }
    
        await Promise.all(promises);
        console.log("All processors initialized in background.");
    }
    

    /**
     * Get all registered processor names
     * @returns {Array<string>}
     */
    getProcessorNames() {
        return Array.from(this.processors.keys());
    }
}
