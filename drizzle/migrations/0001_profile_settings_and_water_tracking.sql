ALTER TABLE public.profiles ADD COLUMN hydration_goal_ml integer NOT NULL DEFAULT 2000 CHECK (hydration_goal_ml > 0);

CREATE TABLE public.water_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  amount_ml integer NOT NULL CHECK (amount_ml > 0),
  data date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.water_intake TO authenticated;
GRANT ALL ON public.water_intake TO service_role;
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own water intake" ON public.water_intake FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX water_intake_user_date ON public.water_intake (user_id, data);

CREATE FUNCTION public.update_profile_settings(p_age integer, p_weight numeric, p_height numeric, p_activity text, p_goal text, p_hydration_goal integer)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  current_user_id uuid := auth.uid();
  previous_weight numeric;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF p_age IS NULL OR p_age NOT BETWEEN 12 AND 100 OR p_weight IS NULL OR p_weight NOT BETWEEN 30 AND 300 OR p_height IS NULL OR p_height NOT BETWEEN 120 AND 230 OR p_activity IS NULL OR p_activity NOT IN ('sedentario', 'leve', 'moderado', 'muito') OR p_goal IS NULL OR p_goal NOT IN ('perder', 'manter', 'ganhar') OR p_hydration_goal IS NULL OR p_hydration_goal <= 0 THEN
    RAISE EXCEPTION 'Revise os dados do perfil';
  END IF;
  SELECT peso INTO previous_weight FROM public.weight_history WHERE user_id = current_user_id ORDER BY data DESC, created_at DESC LIMIT 1;
  UPDATE public.profiles SET idade = p_age, peso = p_weight, altura = p_height, nivel_atividade = p_activity, objetivo = p_goal, hydration_goal_ml = p_hydration_goal WHERE id = current_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Perfil não encontrado'; END IF;
  IF previous_weight IS DISTINCT FROM p_weight THEN
    INSERT INTO public.weight_history (user_id, peso, data) VALUES (current_user_id, p_weight, CURRENT_DATE);
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.update_profile_settings(integer, numeric, numeric, text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_profile_settings(integer, numeric, numeric, text, text, integer) TO authenticated;