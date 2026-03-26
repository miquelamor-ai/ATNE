<?php
declare(strict_types=1);

namespace Atne;

class ProposalEngine
{
    public static function propose(array $chars, array $context): array
    {
        $actives = array_keys(array_filter($chars, fn($v) => $v['actiu'] ?? false));

        $mecr      = $chars['nouvingut']['mecr'] ?? '';
        $teaNivell = (int)($chars['tea']['nivell_suport'] ?? 1);
        $acDoble   = filter_var($chars['altes_capacitats']['doble_excepcionalitat'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $etapa     = $context['etapa'] ?? 'ESO';

        // -- Nivell DUA --
        $dua = 'Core';
        if (
            (in_array('tea', $actives) && $teaNivell === 3) ||
            (in_array('nouvingut', $actives) && $mecr === 'pre-A1'
                && !filter_var($chars['nouvingut']['alfabet_llati'] ?? true, FILTER_VALIDATE_BOOLEAN))
        ) {
            $dua = 'Acces';
        } elseif (in_array('altes_capacitats', $actives) && !$acDoble) {
            $dua = 'Enriquiment';
        }

        // -- Intensitat LF --
        $lfFactors = [];
        if (in_array('tea', $actives)) {
            $lfFactors[] = [3 => 5, 2 => 4, 1 => 2][$teaNivell] ?? 2;
        }
        if (in_array('nouvingut', $actives)) {
            $lfFactors[] = ['pre-A1' => 4, 'A1' => 3, 'A2' => 2, 'B1' => 1, 'B2' => 1][$mecr] ?? 3;
        }
        if (in_array('dislexia', $actives)) {
            $lfFactors[] = 3;
        }
        if (in_array('altes_capacitats', $actives)) {
            $lfFactors[] = 1;
        }
        $lf = $lfFactors ? max($lfFactors) : 2;

        // -- MECR sortida --
        $etapaDefaults = [
            'infantil' => 'A1', 'primaria' => 'B1',
            'ESO' => 'B2', 'batxillerat' => 'B2', 'FP' => 'B2',
        ];
        if (in_array('nouvingut', $actives) && $mecr) {
            $mecrSortida = $mecr;
        } else {
            $mecrSortida = $etapaDefaults[$etapa] ?? 'B2';
        }

        // -- Complements automàtics --
        $complements = [
            'glossari'               => true,
            'definicions_integrades' => $dua === 'Acces'
                                        || in_array($mecr, ['pre-A1', 'A1']),
            'esquema_visual'         => !empty(array_intersect(
                                        ['dislexia', 'tea', 'nouvingut'], $actives)),
            'bastides'               => !empty(array_intersect(
                                        ['nouvingut', 'tea', 'dislexia'], $actives)),
        ];

        return [
            'dua'          => $dua,
            'lf'           => $lf,
            'mecr_sortida' => $mecrSortida,
            'complements'  => $complements,
        ];
    }
}
