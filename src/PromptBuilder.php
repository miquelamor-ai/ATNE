<?php
declare(strict_types=1);

namespace Atne;

class PromptBuilder
{
    public static function build(array $chars, array $params, array $context): string
    {
        $promptsDir = __DIR__ . '/../prompts';

        // CAPA 1: Base (sempre)
        $parts = [file_get_contents("$promptsDir/base.txt")];

        // CAPA 2: Regles per característica activa
        $actives = array_keys(array_filter($chars, fn($v) => $v['actiu'] ?? false));
        foreach ($actives as $char) {
            $file = "$promptsDir/char_{$char}.txt";
            if (file_exists($file)) {
                $parts[] = file_get_contents($file);
            }
        }

        // CAPA 3: Regles de creuament (si >1 característica)
        if (count($actives) > 1) {
            $creuFile = "$promptsDir/creuaments.txt";
            if (file_exists($creuFile)) {
                $parts[] = file_get_contents($creuFile);
            }
        }

        // CAPA 4: Context educatiu
        $etapa  = $context['etapa'] ?? 'ESO';
        $materia = $context['materia'] ?? '(no especificada)';
        $curs   = $context['curs'] ?? '';
        $ambit  = $context['ambit'] ?? '';
        $parts[] = "CONTEXT EDUCATIU:\n- Etapa: {$etapa}" .
            ($curs ? " ({$curs})" : '') .
            "\n- Àmbit: {$ambit}\n- Matèria: {$materia}";

        // CAPA 5: Perfil alumne
        $activeDescs = [];
        $l1 = '';
        foreach ($chars as $key => $val) {
            if (!($val['actiu'] ?? false)) continue;
            $desc = ucfirst(str_replace('_', ' ', $key));
            $subvars = array_filter($val, fn($k) => $k !== 'actiu', ARRAY_FILTER_USE_KEY);
            if ($subvars) {
                $desc .= ' (' . implode(', ', array_map(
                    fn($k, $v) => "$k=$v", array_keys($subvars), $subvars
                )) . ')';
            }
            $activeDescs[] = $desc;
            if ($key === 'nouvingut') $l1 = $val['L1'] ?? '';
        }

        $parts[] = "PERFIL DE L'ALUMNE:\n- Característiques: " .
            (implode(', ', $activeDescs) ?: 'Genèric') .
            "\n- Llengua materna (L1): " . ($l1 ?: '(no especificada)');

        // CAPA 6: Paràmetres d'adaptació
        $duaDescs = [
            'Acces'       => 'LF extrema, suport visual màxim, vocabulari molt bàsic',
            'Core'        => 'Adaptació estàndard mantenint rigor curricular',
            'Enriquiment' => 'Repte cognitiu, connexions interdisciplinars',
        ];
        $dua = $params['dua'] ?? 'Core';
        $lf  = $params['lf'] ?? 2;
        $mecrOut = $params['mecr_sortida'] ?? 'B2';
        $parts[] = "PARÀMETRES D'ADAPTACIÓ:\n" .
            "- Nivell DUA: {$dua} — " . ($duaDescs[$dua] ?? '') . "\n" .
            "- Intensitat Lectura Fàcil: {$lf}/5\n" .
            "- Nivell MECR sortida: {$mecrOut}";

        // CAPA 7: Complements a generar
        $compActius = array_keys(array_filter($params['complements'] ?? []));
        if ($compActius) {
            $parts[] = "COMPLEMENTS A GENERAR:\n" .
                implode("\n", array_map(fn($c) => "- $c", $compActius));
        }

        // CAPA 8: Format de sortida
        $formatFile = "$promptsDir/format_sortida.txt";
        if (file_exists($formatFile)) {
            $parts[] = file_get_contents($formatFile);
        }

        return implode("\n\n", $parts);
    }
}
