import { getSubdomainFromHost } from './engineHost';

describe('getSubdomainFromHost', () => {
    test('extracts subdomain from 3-part generic domain', () => {
        expect(getSubdomainFromHost('fbadban.signalengines.com')).toBe('fbadban');
        expect(getSubdomainFromHost('gbpsuspend.signalengines.com')).toBe('gbpsuspend');
    });

    test('ignores port numbers', () => {
        expect(getSubdomainFromHost('fbadban.signalengines.com:3000')).toBe('fbadban');
    });

    test('returns null for root domain', () => {
        expect(getSubdomainFromHost('signalengines.com')).toBe(null);
        expect(getSubdomainFromHost('www.signalengines.com')).toBe(null);
    });

    test('returns null for localhost', () => {
        expect(getSubdomainFromHost('localhost')).toBe(null);
        expect(getSubdomainFromHost('localhost:3000')).toBe(null);
        expect(getSubdomainFromHost('127.0.0.1')).toBe(null);
    });
});
