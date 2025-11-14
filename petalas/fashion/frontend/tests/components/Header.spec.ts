import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Header from '@/components/Header.vue';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';

describe('Header Component', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/products', name: 'products', component: { template: '<div>Products</div>' } },
        { path: '/cart', name: 'cart', component: { template: '<div>Cart</div>' } },
        { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
      ],
    });
  });

  it('renders logo and brand name', () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    expect(wrapper.text()).toContain('Pétala Fashion');
  });

  it('displays cart items count badge', async () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    const cartStore = useCartStore();
    cartStore.items = [
      { id: '1', product_id: 'p1', quantity: 2, price: 50, product: { name: 'Product' } },
      { id: '2', product_id: 'p2', quantity: 3, price: 30, product: { name: 'Product 2' } },
    ];

    await wrapper.vm.$nextTick();

    expect(wrapper.html()).toContain('5'); // Total items count
  });

  it('shows Sign In link when not authenticated', () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    expect(wrapper.text()).toContain('Sign In');
  });

  it('shows Account link when authenticated', async () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    const authStore = useAuthStore();
    authStore.user = { id: '1', email: 'test@test.com', name: 'Test User' };
    authStore.token = 'test-token';

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Account');
  });

  it('handles search input', async () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    const searchInput = wrapper.find('input[type="text"]');
    expect(searchInput.exists()).toBe(true);

    await searchInput.setValue('test query');
    expect((searchInput.element as HTMLInputElement).value).toBe('test query');
  });

  it('navigates to products page on search submit', async () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    const pushSpy = vi.spyOn(router, 'push');

    const searchInput = wrapper.find('input[type="text"]');
    await searchInput.setValue('shirts');

    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(pushSpy).toHaveBeenCalledWith({
      name: 'products',
      query: { search: 'shirts' },
    });
  });

  it('shows mobile menu toggle button on small screens', () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    const mobileToggle = wrapper.find('button[aria-label="Toggle menu"]');
    expect(mobileToggle.exists()).toBe(true);
  });

  it('toggles mobile menu visibility', async () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    const mobileToggle = wrapper.find('button[aria-label="Toggle menu"]');

    expect(wrapper.vm.mobileMenuOpen).toBe(false);

    await mobileToggle.trigger('click');
    expect(wrapper.vm.mobileMenuOpen).toBe(true);

    await mobileToggle.trigger('click');
    expect(wrapper.vm.mobileMenuOpen).toBe(false);
  });

  it('displays navigation links', () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    expect(wrapper.text()).toContain('Shop');
  });
});
