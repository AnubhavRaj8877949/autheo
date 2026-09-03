import { handleNext, bondMoreValidations } from '../../src/utils/validatorValidations';
import { toast } from '../../src/components/Common/Toast/Toast';

// Mock toast
jest.mock('../../src/components/Common/Toast/Toast', () => ({
    toast: {
        error: jest.fn(),
    },
}));

describe('validatorValidations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('handleNext', () => {
        const setActiveStep = jest.fn();

        describe('Step 0 (Details)', () => {
            it('should validate name length', () => {
                handleNext({ name: 'ab' }, 0, setActiveStep);
                expect(toast.error).toHaveBeenCalledWith('Name should be min 3 \u0026 max 25 character long');

                handleNext({ name: 'a'.repeat(26) }, 0, setActiveStep);
                expect(toast.error).toHaveBeenCalledWith('Name should be min 3 \u0026 max 25 character long');
            });

            it('should validate details length', () => {
                handleNext({ name: 'ValidName', details: 'too short' }, 0, setActiveStep);
                expect(toast.error).toHaveBeenCalledWith('Description should be min 10 \u0026 max 60 character long');

                handleNext({ name: 'ValidName', details: 'a'.repeat(61) }, 0, setActiveStep);
                expect(toast.error).toHaveBeenCalledWith('Description should be min 10 \u0026 max 60 character long');
            });

            it('should validate website URL', () => {
                handleNext({ name: 'ValidName', website: 'invalid-url' }, 0, setActiveStep);
                expect(toast.error).toHaveBeenCalledWith('Please enter a valid website URL.');

                handleNext({ name: 'ValidName', website: 'http://www.' + 'a'.repeat(141) + '.com' }, 0, setActiveStep);
                expect(toast.error).toHaveBeenCalledWith('Website URL must be under 140 characters.');
            });

            it('should validate identity length', () => {
                handleNext({ name: 'ValidName', identity: '123' }, 0, setActiveStep);
                expect(toast.error).toHaveBeenCalledWith('Identity should be min 5 \u0026 max 20 character long');

                handleNext({ name: 'ValidName', identity: 'a'.repeat(21) }, 0, setActiveStep);
                expect(toast.error).toHaveBeenCalledWith('Identity should be min 5 \u0026 max 20 character long');
            });

            it('should validate security contact length', () => {
                handleNext({ name: 'ValidName', securityContact: 'abcd' }, 0, setActiveStep);
                expect(toast.error).toHaveBeenCalledWith('Security contact should be min 5 \u0026 max 50 character long');

                handleNext({ name: 'ValidName', securityContact: 'a'.repeat(51) }, 0, setActiveStep);
                expect(toast.error).toHaveBeenCalledWith('Security contact should be min 5 \u0026 max 50 character long');
            });

            it('should handle all valid optional fields', () => {
                handleNext({
                    name: 'ValidName',
                    details: 'Valid description',
                    website: 'http://valid.com',
                    identity: 'ValidIdentity',
                    securityContact: 'ValidContact'
                }, 0, setActiveStep);
                expect(setActiveStep).toHaveBeenCalled();
            });

            it('should proceed to next step if only name is valid', () => {
                handleNext({ name: 'ValidName' }, 0, setActiveStep);
                expect(setActiveStep).toHaveBeenCalled();
            });
        });

        describe('Step 1 (Staking)', () => {
            it('should validate empty bond amount', () => {
                handleNext({ Bond_Amount: '' }, 1, setActiveStep);
                expect(toast.error).toHaveBeenCalledWith('Enter Bond Amount');
            });

            it('should validate low balance', () => {
                handleNext({ Bond_Amount: '100' }, 1, setActiveStep, '50', '10');
                expect(toast.error).toHaveBeenCalledWith('Low wallet Balance');
            });

            it('should validate min bond amount', () => {
                handleNext({ Bond_Amount: '50' }, 1, setActiveStep, '1000', '10');
                expect(toast.error).toHaveBeenCalledWith('Bond amount should be equal or greater than 100 ');
            });

            it('should validate stake amount vs balance', () => {
                handleNext({ Bond_Amount: '1100' }, 1, setActiveStep, '1000', '10');
                expect(toast.error).toHaveBeenCalledWith('Stake Amount should be less than 1000');
            });

            it('should validate commission rate', () => {
                handleNext({ Bond_Amount: '100', commissionRate: '2' }, 1, setActiveStep, '1000', '10');
                expect(toast.error).toHaveBeenCalledWith('Commission initial rate should be between 5 to 100');
            });

            it('should validate max rate', () => {
                handleNext({ Bond_Amount: '100', commissionRate: '10', maxRate: '5' }, 1, setActiveStep, '1000', '10');
                expect(toast.error).toHaveBeenCalledWith('Commission max rate should be between 10 to 100');
            });

            it('should validate max change rate', () => {
                handleNext({ Bond_Amount: '100', commissionRate: '10', maxRate: '20', maxChangeRate: '15' }, 1, setActiveStep, '1000', '10');
                expect(toast.error).toHaveBeenCalledWith('Commission change rate should be between 0 to 10.00 (Max Rate - Initial Rate)');
            });

            it('should handle noWallet type', () => {
                handleNext({ Bond_Amount: '200', commissionRate: '10', maxRate: '20', maxChangeRate: '5' }, 1, setActiveStep, '1000', '10', 'noWallet');
                expect(setActiveStep).toHaveBeenCalled();
            });

            it('should return true for other wallet types', () => {
                const result = handleNext({ Bond_Amount: '200', commissionRate: '10', maxRate: '20', maxChangeRate: '5' }, 1, setActiveStep, '1000', '10', 'keplr');
                expect(result).toBe(true);
            });
        });

        describe('Default case', () => {
            it('should return undefined for default case', () => {
                const result = handleNext({}, 2, setActiveStep);
                expect(result).toBeUndefined();
            });
        });
    });

    describe('bondMoreValidations', () => {
        const setErrMsg = jest.fn();

        beforeEach(() => {
            setErrMsg.mockClear();
        });

        it('should validate empty bond amount', () => {
            bondMoreValidations({ target: { name: 'Bond_Amount', value: '' } }, setErrMsg, '1000');
            const lastCall = setErrMsg.mock.calls[setErrMsg.mock.calls.length - 1][0];
            expect(lastCall({})).toEqual({ amount: 'Enter bond amount' });
        });

        it('should validate insufficient balance', () => {
            bondMoreValidations({ target: { name: 'Bond_Amount', value: '1100' } }, setErrMsg, '1000');
            const lastCall = setErrMsg.mock.calls[setErrMsg.mock.calls.length - 1][0];
            expect(lastCall({})).toEqual({ amount: 'You have insufficient balance' });
        });

        it('should validate zero bond amount', () => {
            bondMoreValidations({ target: { name: 'Bond_Amount', value: '0' } }, setErrMsg, '1000');
            const lastCall = setErrMsg.mock.calls[setErrMsg.mock.calls.length - 1][0];
            expect(lastCall({})).toEqual({ amount: 'Bonded amount must be greater than 0' });
        });

        it('should validate empty unbond amount', () => {
            bondMoreValidations({ target: { name: 'Unbond_Amount', value: '' } }, setErrMsg, '1000');
            const lastCall = setErrMsg.mock.calls[setErrMsg.mock.calls.length - 1][0];
            expect(lastCall({})).toEqual({ amount: 'Enter unbonding amount' });
        });

        it('should validate insufficient bonded amount', () => {
            bondMoreValidations({ target: { name: 'Unbond_Amount', value: '200' } }, setErrMsg, (100 * 10 ** 18).toString());
            const lastCall = setErrMsg.mock.calls[setErrMsg.mock.calls.length - 1][0];
            expect(lastCall({})).toEqual({ amount: 'You have insufficient bonded amount' });
        });

        it('should validate zero unbond amount', () => {
            bondMoreValidations({ target: { name: 'Unbond_Amount', value: '0' } }, setErrMsg, '1000');
            const lastCall = setErrMsg.mock.calls[setErrMsg.mock.calls.length - 1][0];
            expect(lastCall({})).toEqual({ amount: 'unbonding amount must be greater than 0' });
        });

        it('should validate empty mnemonics', () => {
            bondMoreValidations({ target: { name: 'Mnemonics', value: '' } }, setErrMsg, '1000');
            const lastCall = setErrMsg.mock.calls[setErrMsg.mock.calls.length - 1][0];
            expect(lastCall({})).toEqual({ mnemonics: 'Enter mnemonics' });
        });
    });
});
