describe('routeTableSettings', () => {
    let rewire = require('rewire');
    let routeTableSettings = rewire('../core/routeTableSettings.js');
    let _ = require('lodash');
    let validation = require('../core/validation.js');

    describe('isValidNextHopType', () => {
        let isValidNextHopType = routeTableSettings.__get__('isValidNextHopType');
        
        it('undefined', () => {
            expect(isValidNextHopType()).toEqual(false);
        });

        it('null', () => {
            expect(isValidNextHopType(null)).toEqual(false);
        });

        it('empty', () => {
            expect(isValidNextHopType('')).toEqual(false);
        });

        it('whitespace', () => {
            expect(isValidNextHopType(' ')).toEqual(false);
        });

        it('invalid spacing', () => {
            expect(isValidNextHopType(' VirtualNetworkGateway ')).toEqual(false);
        });

        it('invalid casing', () => {
            expect(isValidNextHopType('virtualnetworkgateway')).toEqual(false);
        });

        it('invalid value', () => {
            expect(isValidNextHopType('NOT_A_VALID_NEXT_HOP_TYPE')).toEqual(false);
        });

        it('VirtualNetworkGateway', () => {
            expect(isValidNextHopType('VirtualNetworkGateway')).toEqual(true);
        });

        it('VnetLocal', () => {
            expect(isValidNextHopType('VnetLocal')).toEqual(true);
        });

        it('Internet', () => {
            expect(isValidNextHopType('Internet')).toEqual(true);
        });

        it('HyperNetGateway', () => {
            expect(isValidNextHopType('HyperNetGateway')).toEqual(true);
        });

        it('None', () => {
            expect(isValidNextHopType('None')).toEqual(true);
        });

        it('VirtualAppliance', () => {
            expect(isValidNextHopType('VirtualAppliance')).toEqual(true);
        });
    });

    describe('validations', () => {
        let routeTableSettingsValidations = routeTableSettings.__get__('routeTableSettingsValidations');

        describe('virtualNetworkValidations', () => {
            let virtualNetworkValidations = routeTableSettingsValidations.virtualNetworks;
            let virtualNetworkSettings = [
                {
                    name: 'my-virtual-network',
                    subnets: ['web', 'biz']
                }
            ];

            it('empty array', () => {
                let errors = validation.validate({
                    settings: [],
                    validations: virtualNetworkValidations
                });

                expect(errors.length).toEqual(0);
            });

            it('name undefined', () => {
                let settings = _.cloneDeep(virtualNetworkSettings);
                delete settings[0].name;

                let errors = validation.validate({
                    settings: settings,
                    validations: virtualNetworkValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('[0].name');
            });

            it('subnets undefined', () => {
                let settings = _.cloneDeep(virtualNetworkSettings);
                delete settings[0].subnets;

                let errors = validation.validate({
                    settings: settings,
                    validations: virtualNetworkValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('[0].subnets');
            });

            it('subnets empty', () => {
                let settings = _.cloneDeep(virtualNetworkSettings);
                settings[0].subnets = [];

                let errors = validation.validate({
                    settings: settings,
                    validations: virtualNetworkValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('[0].subnets');
            });

            it('subnets empty string', () => {
                let settings = _.cloneDeep(virtualNetworkSettings);
                settings[0].subnets = [''];

                let errors = validation.validate({
                    settings: settings,
                    validations: virtualNetworkValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('[0].subnets[0]');
            });
        });

        describe('routeValidations', () => {
            let routeValidations = routeTableSettingsValidations.routes;

            let valid = {
                name: 'name',
                addressPrefix: '10.0.0.1/24',
                nextHopType: 'VirtualNetworkGateway'
            };

            it('name undefined', () => {
                let invalid = _.cloneDeep(valid);
                delete invalid.name;
                let errors = validation.validate({
                    settings: [invalid],
                    validations: routeValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('[0].name');
            });

            it('addressPrefix undefined', () => {
                let invalid = _.cloneDeep(valid);
                delete invalid.addressPrefix;
                let errors = validation.validate({
                    settings: [invalid],
                    validations: routeValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('[0].addressPrefix');
            });

            it('nextHopType undefined', () => {
                let invalid = _.cloneDeep(valid);
                delete invalid.nextHopType;
                let errors = validation.validate({
                    settings: [invalid],
                    validations: routeValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('[0].nextHopType');
            });

            it('nextHopIpAddress undefined', () => {
                let invalid = _.cloneDeep(valid);
                invalid.nextHopType = 'VirtualAppliance';
                let errors = validation.validate({
                    settings: [invalid],
                    validations: routeValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('[0].nextHopIpAddress');
            });
        });

        describe('routeTableSettingsValidations', () => {
            let routeTableSettings = {
                name: 'my-route-table',
                virtualNetworks: [
                    {
                        name: 'my-virtual-network',
                        subnets: [
                            'biz',
                            'web'
                        ]
                    }
                ],
                routes: [
                    {
                        name: 'route1',
                        addressPrefix: '10.0.1.0/24',
                        nextHopType: 'VnetLocal'
                    },
                    {
                        name: 'route2',
                        addressPrefix: '10.0.2.0/24',
                        nextHopType: 'VirtualAppliance',
                        nextHopIpAddress: '192.168.1.1'
                    }
                ],
                tags: {}
            };

            it('name undefined', () => {
                let settings = _.cloneDeep(routeTableSettings);
                delete settings.name;
                let errors = validation.validate({
                    settings: settings,
                    validations: routeTableSettingsValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('.name');
            });

            it('virtualNetwork empty', () => {
                let settings = _.cloneDeep(routeTableSettings);
                settings.virtualNetworks = [];
                let errors = validation.validate({
                    settings: settings,
                    validations: routeTableSettingsValidations
                });

                expect(errors.length).toEqual(0);
            });

            it('routes undefined', () => {
                let settings = _.cloneDeep(routeTableSettings);
                delete settings.routes;
                let errors = validation.validate({
                    settings: settings,
                    validations: routeTableSettingsValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('.routes');
            });

            it('routes null', () => {
                let settings = _.cloneDeep(routeTableSettings);
                settings.routes = null;
                let errors = validation.validate({
                    settings: settings,
                    validations: routeTableSettingsValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('.routes');
            });

            it('routes empty', () => {
                let settings = _.cloneDeep(routeTableSettings);
                settings.routes = [];
                let errors = validation.validate({
                    settings: settings,
                    validations: routeTableSettingsValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('.routes');
            });

            it('duplicate route name', () => {
                let settings = _.cloneDeep(routeTableSettings);
                settings.routes[1].name = 'route1';
                let errors = validation.validate({
                    settings: settings,
                    validations: routeTableSettingsValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('.routes');
            });
        });
    });

    describe('merge', () => {
        let routeTableSettingsDefaults = routeTableSettings.__get__('routeTableSettingsDefaults');
        let mergeCustomizer = routeTableSettings.__get__('mergeCustomizer');

        let routeTable = {
            name: 'my-route-table',
            virtualNetworks: [
                {
                    name: 'my-virtual-network',
                    subnets: [
                        'biz',
                        'web'
                    ]
                }
            ],
            routes: [
                {
                    name: 'route1',
                    addressPrefix: '10.0.1.0/24',
                    nextHopType: 'VnetLocal'
                },
                {
                    name: 'route2',
                    addressPrefix: '10.0.2.0/24',
                    nextHopType: 'VirtualAppliance',
                    nextHopIpAddress: '192.168.1.1'
                }
            ]
        };

        it('virtualNetworks undefined', () => {
            let settings = _.cloneDeep(routeTable);
            delete settings.virtualNetworks;
            let merged = validation.merge(settings, routeTableSettingsDefaults, mergeCustomizer);
            expect(merged.virtualNetworks.length).toBe(0);
        });

        it('virtualNetworks null', () => {
            let settings = _.cloneDeep(routeTable);
            settings.virtualNetworks = null;
            let merged = validation.merge(settings, routeTableSettingsDefaults, mergeCustomizer);
            expect(merged.virtualNetworks.length).toBe(0);
        });

        it('virtualNetworks present', () => {
            let settings = _.cloneDeep(routeTable);
            let merged = validation.merge(settings, routeTableSettingsDefaults, mergeCustomizer);
            expect(merged.virtualNetworks[0].name).toBe('my-virtual-network');
        });

        it('routes undefined', () => {
            let settings = _.cloneDeep(routeTable);
            delete settings.routes;
            let merged = validation.merge(settings, routeTableSettingsDefaults, mergeCustomizer);
            expect(merged.routes.length).toBe(0);
        });

        it('routes null', () => {
            let settings = _.cloneDeep(routeTable);
            settings.routes = null;
            let merged = validation.merge(settings, routeTableSettingsDefaults, mergeCustomizer);
            expect(merged.routes.length).toBe(0);
        });

        it('routes present', () => {
            let settings = _.cloneDeep(routeTable);
            let merged = validation.merge(settings, routeTableSettingsDefaults, mergeCustomizer);
            expect(merged.routes[0].name).toBe('route1');
        });
    });

    describe('transform', () => {
        let routeTable = [
            {
                name: 'my-route-table',
                virtualNetworks: [
                    {
                        name: 'my-virtual-network',
                        subnets: [
                            'biz',
                            'web'
                        ]
                    }
                ],
                routes: [
                    {
                        name: 'route1',
                        addressPrefix: '10.0.1.0/24',
                        nextHopType: 'VnetLocal'
                    },
                    {
                        name: 'route2',
                        addressPrefix: '10.0.2.0/24',
                        nextHopType: 'VirtualAppliance',
                        nextHopIpAddress: '192.168.1.1'
                    }
                ],
                tags: {}
            }
        ];

        let buildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-rg'
        };

        it('single route table', () => {
            let settings = _.cloneDeep(routeTable);
            settings = settings[0];
            let result = routeTableSettings.transform({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            });

            expect(result.routeTables.length).toBe(1);
            let settingsResult = result.routeTables[0];
            expect(settingsResult.hasOwnProperty('id')).toBe(true);
            expect(settingsResult.name).toBe(settings.name);
            expect(settingsResult.resourceGroupName).toEqual(buildingBlockSettings.resourceGroupName);
            expect(settingsResult.subscriptionId).toEqual(buildingBlockSettings.subscriptionId);
            
            expect(settingsResult.properties.routes.length).toBe(2);
            let routesResult = settingsResult.properties.routes;
            expect(routesResult[0].name).toEqual(settings.routes[0].name);
            expect(routesResult[0].properties.addressPrefix).toEqual(settings.routes[0].addressPrefix);
            expect(routesResult[0].properties.nextHopType).toEqual(settings.routes[0].nextHopType);
            expect(routesResult[1].name).toEqual(settings.routes[1].name);
            expect(routesResult[1].properties.addressPrefix).toEqual(settings.routes[1].addressPrefix);
            expect(routesResult[1].properties.nextHopType).toEqual(settings.routes[1].nextHopType);
            expect(routesResult[1].properties.nextHopIpAddress).toEqual(settings.routes[1].nextHopIpAddress);

            expect(result.subnets.length).toEqual(2);
            expect(result.subnets[0].id.endsWith('my-virtual-network/subnets/biz')).toBe(true);
            expect(result.subnets[1].id.endsWith('my-virtual-network/subnets/web')).toBe(true);
        });

        it('single route table with no virtual networks', () => {
            let settings = _.cloneDeep(routeTable);
            settings = settings[0];
            delete settings.virtualNetworks;
            let result = routeTableSettings.transform({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            });

            expect(result.routeTables.length).toBe(1);
            let settingsResult = result.routeTables[0];
            expect(settingsResult.hasOwnProperty('id')).toBe(true);
            expect(settingsResult.name).toBe(settings.name);
            expect(settingsResult.resourceGroupName).toEqual(buildingBlockSettings.resourceGroupName);
            expect(settingsResult.subscriptionId).toEqual(buildingBlockSettings.subscriptionId);
            
            expect(settingsResult.properties.routes.length).toBe(2);
            let routesResult = settingsResult.properties.routes;
            expect(routesResult[0].name).toEqual(settings.routes[0].name);
            expect(routesResult[0].properties.addressPrefix).toEqual(settings.routes[0].addressPrefix);
            expect(routesResult[0].properties.nextHopType).toEqual(settings.routes[0].nextHopType);
            expect(routesResult[1].name).toEqual(settings.routes[1].name);
            expect(routesResult[1].properties.addressPrefix).toEqual(settings.routes[1].addressPrefix);
            expect(routesResult[1].properties.nextHopType).toEqual(settings.routes[1].nextHopType);
            expect(routesResult[1].properties.nextHopIpAddress).toEqual(settings.routes[1].nextHopIpAddress);

            expect(result.subnets.length).toEqual(0);
        });

        it('test settings validation errors', () => {
            let settings = _.cloneDeep(routeTable);
            delete settings[0].name;
            expect(() => {
                routeTableSettings.transform({
                    settings: settings,
                    buildingBlockSettings: buildingBlockSettings
                });
            }).toThrow();
        });

        it('test building blocks validation errors', () => {
            let settings = _.cloneDeep(routeTable);
            let bbSettings = _.cloneDeep(buildingBlockSettings);
            delete bbSettings.subscriptionId;
            expect(() => {
                routeTableSettings.transform({
                    settings: settings,
                    buildingBlockSettings: bbSettings
                });
            }).toThrow();
        });
    });
});