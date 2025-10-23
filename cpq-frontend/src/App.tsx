import { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import { useForm } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { FormField, FormRow, ResultCard, StatusBar } from './components/FormPrimitives';
import { fefcoFoldingOptions, fefcoWrappingOptions, fefcoAuxiliaryOptions, cardboardTypeOptions, cardboardGradeOptions, printOptions, type QuoteFormData } from './validation';
import { postQuote, type ApiResponse } from './api';
import { calculateTariffs, getAllTariffInfos, applyCustomPrices, type TariffType } from './calculations/tariff-calculator';
import { useLocalStorage } from './utils/useLocalStorage';

type Status = 'idle' | 'loading' | 'success' | 'error';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function pushEvent(event: unknown) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm<QuoteFormData>({
    mode: 'all',
    defaultValues: {
      print: undefined,
      unit_price: 0,
    },
  });

  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [customPrices, setCustomPrices] = useState<Record<TariffType, number | null>>({} as Record<TariffType, number | null>);
  const [customDays, setCustomDays] = useState<Record<TariffType, number | null>>({} as Record<TariffType, number | null>);
  const abortRef = useRef<AbortController | null>(null);
  const hasRestoredRef = useRef(false);

  // Keep form validation in sync - только при изменении полей формы
  useEffect(() => {
    const subscription = watch((_value, { name, type }) => {
      // Триггерим валидацию только при изменении полей
      if (type === 'change' && name) {
        void trigger(name);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger]);

  // Автосохранение данных формы
  const [formData, setFormData, clearFormData] = useLocalStorage('cpq-form-data', {} as Partial<QuoteFormData>);
  const [tariffState, setTariffState, clearTariffState] = useLocalStorage('cpq-tariff-state', {
    customPrices: {} as Record<TariffType, number | null>,
    customDays: {} as Record<TariffType, number | null>,
  });

  // Восстановление сохраненных данных при монтировании компонента
  useEffect(() => {
    if (hasRestoredRef.current) return; // Only run once
    hasRestoredRef.current = true;
    
    // Восстанавливаем данные формы
    if (Object.keys(formData).length > 0) {
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          setValue(key as keyof QuoteFormData, value);
        }
      });
    }

    // Восстанавливаем состояние тарифов
    if (Object.keys(tariffState.customPrices).length > 0) {
      setCustomPrices(tariffState.customPrices);
    }
    if (Object.keys(tariffState.customDays).length > 0) {
      setCustomDays(tariffState.customDays);
    }
  }, []); // Empty deps - run only on mount

  // Автосохранение данных формы при изменении
  useEffect(() => {
    const subscription = watch((formValues) => {
      // Исключаем пустые значения и сохраняем только заполненные поля
      const filteredData = Object.fromEntries(
        Object.entries(formValues).filter(([_, value]) => 
          value !== undefined && value !== null && value !== ''
        )
      );
      setFormData(filteredData);
    });
    return () => subscription.unsubscribe();
  }, [watch, setFormData]);

  // Автосохранение состояния тарифов при изменении
  useEffect(() => {
    setTariffState({
      customPrices,
      customDays,
    });
  }, [customPrices, customDays, setTariffState]);

  // Функция для полной очистки формы и сохраненных данных
  const clearForm = () => {
    // Сбрасываем форму к начальным значениям
    setValue('fefco', '');
    setValue('cardboard_type', '');
    setValue('cardboard_grade', '');
    setValue('x_mm', 0);
    setValue('y_mm', 0);
    setValue('z_mm', 0);
    setValue('print', '');
    setValue('qty', 0);
    setValue('delivery_days', 0);
    setValue('unit_price', 0);
    setValue('company', '');
    setValue('contact_name', '');
    setValue('city', '');
    setValue('phone', '');
    setValue('email', '');
    
    // Сбрасываем состояние тарифов
    setCustomPrices({} as Record<TariffType, number | null>);
    setCustomDays({} as Record<TariffType, number | null>);
    
    // Очищаем localStorage
    clearFormData();
    clearTariffState();
    
    // Сбрасываем статус
    setStatus('idle');
    setResult(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    // eslint-disable-next-line no-console
    console.log('onSubmit values', values);
    pushEvent({ event: 'cpq_form_submit' });
    setStatus('loading');
    setResult(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    
    // Добавляем информацию о тарифе к данным формы
    const finalTariffs = applyCustomPrices(tariffs, customPrices);
    const payload = {
      ...values,
      batch_cost: batchCost, // Добавляем рассчитанную стоимость партии
      selected_tariff: 'standard', // Всегда отправляем стандартный тариф
      final_price: finalTariffs['standard'],
      // Добавляем пользовательские цены
      custom_standard_price: customPrices.standard ?? undefined,
      custom_urgent_price: customPrices.urgent ?? undefined,
      custom_strategic_price: customPrices.strategic ?? undefined,
      // Добавляем пользовательские сроки
      custom_standard_days: customDays.standard ?? undefined,
      custom_urgent_days: customDays.urgent ?? undefined,
      custom_strategic_days: customDays.strategic ?? undefined,
      consent_given: true, // Добавляем согласие на обработку данных
      // Убираем пустые строки для необязательных полей
      cardboard_grade: values.cardboard_grade || undefined,
      print: values.print || undefined,
      company: values.company || undefined,
      contact_name: values.contact_name || undefined,
      city: values.city || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      tg_username: values.tg_username || undefined,
    };
    
    const res = await postQuote(payload as any, abortRef.current.signal).catch((err) => ({ ok: false as const, error: String(err) }));
    if (res.ok) {
      pushEvent({ event: 'cpq_api_ok', lead_id: res.lead_id });
      setResult(res);
      setStatus('success');
      // Очищаем сохраненные данные после успешной отправки
      clearFormData();
      clearTariffState();
    } else {
      pushEvent({ event: 'cpq_api_error', message: res.error });
      setResult(res);
      setStatus('error');
    }
  });

  const cardboardTypeItems = useMemo(() => cardboardTypeOptions, []);
  const cardboardGradeItems = useMemo(() => cardboardGradeOptions, []);
  const printItems = useMemo(() => printOptions, []);

  // Получаем выбранный тип картона для условного отображения марки
  const watchedCardboardType = watch('cardboard_type');
  
  // Получаем цену за единицу, количество и сроки для расчета тарифов
  const watchedUnitPrice = watch('unit_price') || 0;
  const watchedQty = watch('qty') || 0;
  const watchedDeliveryDays = watch('delivery_days') || 0;
  
  // Рассчитываем стоимость партии автоматически
  const batchCost = useMemo(() => watchedUnitPrice * watchedQty, [watchedUnitPrice, watchedQty]);
  
  // Рассчитываем все варианты тарифов с мемоизацией
  const tariffs = useMemo(() => calculateTariffs(watchedUnitPrice, watchedQty, watchedDeliveryDays), [watchedUnitPrice, watchedQty, watchedDeliveryDays]);
  const tariffInfos = useMemo(() => getAllTariffInfos(watchedUnitPrice, watchedQty, watchedDeliveryDays), [watchedUnitPrice, watchedQty, watchedDeliveryDays]);

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="mb-6 text-2xl font-semibold">Коммерческое предложение — Гофрокороба</h1>

      <form onSubmit={onSubmit} noValidate>
        <fieldset className="rounded-md border p-4">
          <legend className="px-1 text-base font-medium">Параметры коробки</legend>
          <FormRow>
            <FormField id="fefco" label="Код по FEFCO" required error={errors.fefco?.message}>
              <select className="w-full rounded-md border px-3 py-2" {...register('fefco')}> 
                <option value="">— выберите —</option>
                <optgroup label="Складные гофрокороба">
                  {fefcoFoldingOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Обёрточные гофрокороба">
                  {fefcoWrappingOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Вспомогательные элементы">
                  {fefcoAuxiliaryOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </optgroup>
              </select>
            </FormField>

            <FormField id="cardboard_type" label="Тип картона" required error={errors.cardboard_type?.message}>
              <select className="w-full rounded-md border px-3 py-2" {...register('cardboard_type')}>
                <option value="">— выберите —</option>
                {cardboardTypeItems.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </FormField>
          </FormRow>

          {watchedCardboardType === "3-х слойный гофрокартон" && (
            <FormRow>
              <FormField id="cardboard_grade" label="Марка картона" required error={errors.cardboard_grade?.message}>
                <select className="w-full rounded-md border px-3 py-2" {...register('cardboard_grade')}>
                  <option value="">— выберите —</option>
                  {cardboardGradeItems.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </FormField>
            </FormRow>
          )}

          <FormRow columns={3}>
            {(['x_mm', 'y_mm', 'z_mm'] as const).map((dim) => (
              <FormField key={dim} id={dim} label={dim.toUpperCase().replace('_MM', '') + ', мм'} required error={errors[dim]?.message}>
                <input
                  type="number"
                  inputMode="numeric"
                  min={20}
                  max={1200}
                  step={1}
                  className="w-full rounded-md border px-3 py-2"
                  {...register(dim, { valueAsNumber: true })}
                />
              </FormField>
            ))}
          </FormRow>

          <FormRow>
            <FormField id="print" label="Печать" error={errors.print?.message}>
              <select className="w-full rounded-md border px-3 py-2" {...register('print')}>
                <option value="">— выберите —</option>
                {printItems.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="qty" label="Тираж" required error={errors.qty?.message}>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={100000}
                step={1}
                className="w-full rounded-md border px-3 py-2"
                {...register('qty', { valueAsNumber: true })}
              />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField id="delivery_days" label="Кол-во рабочих дней" required error={errors.delivery_days?.message}>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="10"
                className="w-full rounded-md border px-3 py-2"
                {...register('delivery_days', { valueAsNumber: true })}
              />
            </FormField>

            <FormField id="unit_price" label="Цена за единицу коробки" required error={errors.unit_price?.message}>
              <input
                type="number"
                inputMode="numeric"
                min={0.01}
                max={1000000}
                step={0.01}
                placeholder="0.00"
                className="w-full rounded-md border px-3 py-2"
                {...register('unit_price', { valueAsNumber: true })}
              />
            </FormField>
          </FormRow>


          {/* Переключатель тарифов */}
          {watchedUnitPrice > 0 && watchedDeliveryDays > 0 && (
            <FormRow>
              <FormField id="tariff_selection" label="Доступные тарифы">
                <div className="space-y-3">
                  {tariffInfos.map((tariff) => (
                    <div
                      key={tariff.type}
                      className="p-3 rounded-md border border-gray-300 bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {tariff.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tariff.description} • {tariff.deliveryDays} рабочих дней
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm text-gray-600">Цена:</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={tariff.price.toString()}
                            value={customPrices[tariff.type] ?? ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : Number(e.target.value);
                              setCustomPrices(prev => ({
                                ...prev,
                                [tariff.type]: value
                              }));
                            }}
                            className="flex-1 rounded border px-2 py-1 text-sm"
                          />
                          <span className="text-sm text-gray-600">руб</span>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm text-gray-600">Срок:</span>
                          <input
                            type="number"
                            placeholder={tariff.deliveryDays.toString()}
                            value={customDays[tariff.type] ?? ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : Number(e.target.value);
                              setCustomDays(prev => ({
                                ...prev,
                                [tariff.type]: value
                              }));
                            }}
                            className="flex-1 rounded border px-2 py-1 text-sm"
                          />
                          <span className="text-sm text-gray-600">дней</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </FormField>
            </FormRow>
          )}
        </fieldset>

        <fieldset className="mt-6 rounded-md border p-4">
          <legend className="px-1 text-base font-medium">Контакты и доставка</legend>
          <FormRow>
            <FormField id="company" label="Компания" error={errors.company?.message}>
              <input className="w-full rounded-md border px-3 py-2" maxLength={120} {...register('company')} />
            </FormField>
            <FormField id="contact_name" label="Контактное лицо" error={errors.contact_name?.message}>
              <input className="w-full rounded-md border px-3 py-2" maxLength={80} {...register('contact_name')} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField id="city" label="Город" error={errors.city?.message}>
              <input className="w-full rounded-md border px-3 py-2" maxLength={80} {...register('city')} />
            </FormField>
            <FormField id="phone" label="Телефон" hint="+7 999 999-99-99" error={errors.phone?.message}>
              <IMaskInput
                mask={'+{7} 000 000-00-00'}
                className="w-full rounded-md border px-3 py-2"
                onAccept={(value: string) => setValue('phone', value, { shouldDirty: true, shouldValidate: true })}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue('phone', e.target.value, { shouldDirty: true, shouldValidate: true })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField id="email" label="Email" error={errors.email?.message}>
              <input type="email" className="w-full rounded-md border px-3 py-2" {...register('email')} />
            </FormField>
          </FormRow>
        </fieldset>

        <fieldset className="mt-6 rounded-md border p-4">
          <legend className="px-1 text-base font-medium">Согласие</legend>
          <div className="flex items-start gap-3">
            <input id="consent" type="checkbox" className="mt-1 h-4 w-4" required />
            <label htmlFor="consent" className="text-sm text-gray-800">
              Согласен на обработку персональных данных
              {' '}
              <a className="underline" href="#" target="_blank" rel="noreferrer noopener">
                политика
              </a>
            </label>
          </div>
        </fieldset>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          >
            Сформировать КП
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          >
            Очистить форму
          </button>
          {status === 'error' && (
            <button
              type="button"
              onClick={() => {
                setStatus('idle');
                setResult(null);
              }}
              className="inline-flex items-center rounded-md border px-4 py-2"
            >
              Повторить
            </button>
          )}
        </div>

        <StatusBar status={status} message={result && !result.ok ? result.error : undefined} />

        {result && result.ok && (
          <ResultCard
            pdfUrl={result.pdf_url}
            leadId={result.lead_id}
            onClick={() => pushEvent({ event: 'cpq_pdf_link_click' })}
          />
        )}
      </form>
    </main>
  );
}

export default App;
